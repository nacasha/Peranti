import { AppletType } from "src/enums/applet-type.js"
import { type AppletConstructor } from "src/models/AppletConstructor.js"
import { type AppletInput } from "src/types/AppletInput.js"

import { appletComponentService } from "./applet-component-service.js"
import { appletStore } from "./applet-store.js"

export interface AppletFileTarget {
  applet: AppletConstructor
  /** Input field the dropped file content will be written into. */
  inputFieldKey: string
  /** Component of that field, used to decide how the file is read. */
  component: AppletInput["component"]
  /** Whether that field reads the file through its batch component. */
  isBatch: boolean
}

export interface RankedAppletFileTarget extends AppletFileTarget {
  /** Declared extensions the drop matched, for display on the row. */
  matchedExtensions: string[]
  /** True when the applet declares every extension in the drop. */
  isFullMatch: boolean
  isActiveApplet: boolean
}

/**
 * Decides which applets can receive a dropped file, and in what order to offer
 * them. Kept apart from `fileDropService` so the matching rules can be reasoned
 * about (and reused) without dragging in the drop lifecycle state.
 */
class AppletFileSupportService {
  /**
   * Resolves `inputFields` to a plain array. Applets may declare it as a
   * function of the current input values; there are no values yet at drop time,
   * so it is probed with an empty object and skipped if it cannot cope.
   */
  private resolveInputFields(applet: AppletConstructor): Array<AppletInput<any>> {
    if (typeof applet.inputFields !== "function") {
      return applet.inputFields
    }

    try {
      return applet.inputFields({})
    } catch (exception) {
      return []
    }
  }

  /**
   * Finds the field a dropped file would land in, mirroring the rule used by
   * `Applet.getInputFieldsWithReadableFile`: prefer a field whose component can
   * read a file directly, otherwise fall back to a batch-capable field whose
   * batch component can.
   */
  getFileTarget(applet: AppletConstructor): AppletFileTarget | undefined {
    const inputFields = this.resolveInputFields(applet)

    let hasAllowBatch = false

    const directField = inputFields.find((inputField) => {
      if (inputField.allowBatch) {
        hasAllowBatch = true
      }

      return !!appletComponentService.getInputComponent(inputField.component).readFileAs
    })

    if (directField) {
      return { applet, inputFieldKey: directField.key, component: directField.component, isBatch: false }
    }

    if (!hasAllowBatch) {
      return undefined
    }

    const batchField = inputFields.find(
      (inputField) => !!appletComponentService.getInputComponent(inputField.component, true).readFileAs
    )

    if (!batchField) {
      return undefined
    }

    return { applet, inputFieldKey: batchField.key, component: batchField.component, isBatch: true }
  }

  /**
   * Every applet that can take a file drop at all — the pool the picker lists.
   * Pages (settings and friends) are excluded because they are not editors.
   */
  private getDroppableApplets() {
    return appletStore.listOfLoadedApplets.filter((applet) => {
      if (applet.type === AppletType.Page || applet.hideOnSidebar) {
        return false
      }

      return !!this.getFileTarget(applet)
    })
  }

  /**
   * Orders the droppable applets for a set of dropped extensions: the applets
   * declaring the most of them first, then everything else alphabetically. The
   * active applet is pinned to the top so the current tool stays one click away.
   */
  getRankedFileTargets(extensions: string[], activeAppletId: string): RankedAppletFileTarget[] {
    const droppedExtensions = [...new Set(extensions.filter(Boolean))]

    const targets = this.getDroppableApplets().map((applet) => {
      const declared = applet.fileExtensions ?? []
      const matchedExtensions = droppedExtensions.filter((extension) => declared.includes(extension))

      const target = this.getFileTarget(applet) as AppletFileTarget

      return {
        ...target,
        matchedExtensions,
        isFullMatch: droppedExtensions.length > 0 && matchedExtensions.length === droppedExtensions.length,
        isActiveApplet: applet.appletId === activeAppletId
      }
    })

    return targets.sort((left, right) => {
      if (left.isActiveApplet !== right.isActiveApplet) {
        return left.isActiveApplet ? -1 : 1
      }

      if (left.matchedExtensions.length !== right.matchedExtensions.length) {
        return right.matchedExtensions.length - left.matchedExtensions.length
      }

      return left.applet.name.localeCompare(right.applet.name)
    })
  }
}

export const appletFileSupportService = new AppletFileSupportService()
