import { ask } from "@tauri-apps/plugin-dialog"
import toast from "react-hot-toast"

import { AppletType } from "src/enums/applet-type"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

import { activeAppletStore } from "./active-applet-store.js"
import { appletStore } from "./applet-store.js"
import { sessionStore } from "./session-store.js"

/**
 * Largest set of values a component can open a tool with, as JSON
 */
const MAX_VALUES_SIZE = 1024 * 1024

async function confirm(message: string): Promise<boolean> {
  if (isRunningInTauri) {
    return await ask(message, { title: "Peranti", kind: "warning", okLabel: "Open", cancelLabel: "Cancel" })
  }
  return window.confirm(message)
}

/**
 * The values a tool can take: only its input keys, as plain JSON
 */
function inputValuesFor(tool: AppletConstructor, values: unknown): Record<string, unknown> | undefined {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return {}
  }

  let plain: Record<string, unknown>
  try {
    const json = JSON.stringify(values)
    if (json.length > MAX_VALUES_SIZE) {
      return undefined
    }
    plain = JSON.parse(json)
  } catch {
    return undefined
  }

  // Fields built from the values themselves can't be listed ahead: keep every key
  if (typeof tool.inputFields === "function") {
    return plain
  }
  const keys = new Set(tool.inputFields.map((field) => field.key))
  return Object.fromEntries(Object.entries(plain).filter(([key]) => keys.has(key)))
}

/**
 * Opens a tool for an extension component (`peranti.openTool`), with some of
 * its inputs filled in:
 * - built-in tools and the extension's own tools open right away, another
 *   extension's tools after you confirm
 * - a tool kept to one tab gets the values in that tab, after you confirm
 * - an executable tool never runs on its own when opened this way: its
 *   values come from the component, so you press Run
 */
class OpenToolService {
  async openFromComponent(sourceExtensionId: string | undefined, toolId: string, values: unknown) {
    const tool = appletStore.mapOfLoadedApplets[toolId] as AppletConstructor | undefined
    if (!tool || (tool.type !== undefined && tool.type !== AppletType.Tool && tool.type !== AppletType.Extension)) {
      toast.error(`No tool "${toolId}" to open`)
      return
    }

    const inputValues = inputValuesFor(tool, values)
    if (!inputValues) {
      toast.error(`Can't open ${tool.name}: its values aren't JSON, or are over 1 MB`)
      return
    }

    const isOtherExtension = tool.type === AppletType.Extension &&
      !(sourceExtensionId && toolId.startsWith(`${sourceExtensionId}/`))
    if (isOtherExtension && !(await confirm(`An extension asks to open "${tool.name}" from another extension, with values it filled in. Open it?`))) {
      return
    }

    const isExecutable = tool.metadata?.runtime === ExtensionRuntime.Executable
    const isSingleTab = tool.disableMultipleSession === true || !sessionStore.enableMultipleSession
    const openSession = isSingleTab ? sessionStore.getRunningSessionsFromAppletId(tool.appletId)[0] : undefined

    if (openSession) {
      if (!(await confirm(`"${tool.name}" is already open. Replace its values with the ones an extension filled in?`))) {
        return
      }
      await sessionStore.openSession(openSession)
      const applet = activeAppletStore.getActiveApplet()
      if (applet.sessionId === openSession.sessionId) {
        // Not marked as edited, so an executable tool doesn't run on its own
        applet.setInputValues({ ...applet.inputValues, ...inputValues }, { markAsModified: !isExecutable })
      }
      return
    }

    sessionStore.createSession(tool, {
      initialState: {
        inputValues,
        // Opened with values it didn't choose: an executable tool waits for Run
        ...(isExecutable ? { isAutoRunAndFirstTime: false } : {})
      }
    })
  }
}

export const openToolService = new OpenToolService()
