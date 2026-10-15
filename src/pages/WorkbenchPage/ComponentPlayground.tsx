import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useCallback, useRef, useState, type FC } from "react"
import SimpleBar from "simplebar-react"

import { BaseCodeMirror } from "src/components/common/BaseCodeMirror"
import { Button } from "src/components/common/Button"
import { ExtensionComponentFrame } from "src/components/extension/ExtensionComponentFrame"
import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { ExtensionComponentKindLabels } from "src/constants/extension-component-kind-labels"
import { ComponentMessageType, HostMessageType } from "src/constants/extension-component-protocol"
import { Icons } from "src/constants/icons"
import { AppletComponentContext } from "src/contexts/AppletComponentContext"
import { ExtensionDetailsHeader } from "src/pages/ExtensionsPage/ExtensionDetailsHeader.tsx"
import { appletStore } from "src/services/applet-store"
import { resolveDiskPath } from "src/services/extension-storage"
import { fileService } from "src/services/file-service"
import { type ComponentPlaygroundTarget } from "src/types/ComponentPlaygroundTarget"
import { type ComponentPropInfo } from "src/types/ComponentPropInfo"
import { type ComponentValueInfo } from "src/types/ComponentValueInfo"
import { type ExtensionComponentDebugEvent } from "src/types/ExtensionComponentDebugEvent"
import { checkComponentProps } from "src/utils/component/check-component-props"
import { checkComponentValueStructure } from "src/utils/component/check-component-value-structure"
import { getBuiltInComponentUsages } from "src/utils/component/get-built-in-component-usages"
import { getComponentPropStartingValue } from "src/utils/component/get-component-prop-starting-value"
import { formatJson } from "src/utils/data/format-json"
import { parseJsonOrError } from "src/utils/data/parse-json-or-error"
import { getExtensionComponentUsages } from "src/utils/extension/get-extension-component-usages"

import "./ComponentPlayground.scss"

/**
 * Oldest log lines are dropped past this
 */
const MAX_LOG_ENTRIES = 300
interface LogEntry {
  id: number
  time: string
  direction: "in" | "out" | "console"
  type: string
  level?: string
  detail: string
}

type SidePanel = "value" | "props" | "log"

interface ComponentPlaygroundProps {
  target: ComponentPlaygroundTarget
}

/**
 * Try a component outside a tool: set its value and props by hand and see
 * what it sends back. An extension's component also shows the messages and
 * console output of its frame.
 */
export const ComponentPlayground: FC<ComponentPlaygroundProps> = observer(({ target }) => {
  const isExtension = target.type === "extension"
  const kind = isExtension ? (target.component.definition.kind ?? "both") : target.entry.kind
  const name = isExtension ? target.component.definition.name : target.entry.name
  const description = isExtension ? target.component.definition.description : undefined
  const usages = isExtension
    ? getExtensionComponentUsages(target.extension, target.component.definition.componentId)
    : getBuiltInComponentUsages(target.entry.name)

  // Starts from the first tool field that uses it, so it opens looking real
  const firstUsage = usages.find((usage) => kind === "both" || usage.mode === kind) ?? usages[0]

  const initialMode = kind === "output" ? "output" : (firstUsage?.mode ?? "input")

  // What the value is, per side: a built-in name can be two components
  const getValueInfo = (side: "input" | "output"): ComponentValueInfo => {
    if (isExtension) {
      return target.component.definition.value ?? { type: "any" }
    }
    return (side === "input" ? target.entry.input : target.entry.output)?.value ?? { type: "any" }
  }

  // A real field's default first, else the documented example
  // An empty default shows nothing, the example says more
  const usageDefault = firstUsage?.defaultValue === "" ? undefined : firstUsage?.defaultValue
  const initialValue = usageDefault ?? getValueInfo(initialMode).example ?? null

  // The field's own props over the component's examples: a tool that fills
  // a list's items while running leaves them out of its props
  const exampleProps = isExtension
    ? undefined
    : (initialMode === "input" ? target.entry.input : target.entry.output)?.exampleProps
  const initialProps = { ...exampleProps, ...firstUsage?.props }

  const [mode, setMode] = useState<"input" | "output">(initialMode)
  const [value, setValue] = useState<unknown>(initialValue)
  const [valueText, setValueText] = useState(() => formatJson(initialValue))
  const [valueError, setValueError] = useState<string>()
  const [fieldProps, setFieldProps] = useState<Record<string, unknown>>(initialProps)
  const [propsText, setPropsText] = useState(() => formatJson(initialProps))
  const [propsError, setPropsError] = useState<string>()
  const [frameKey, setFrameKey] = useState(0)
  const [height, setHeight] = useState<number>()
  const [panel, setPanel] = useState<SidePanel>("value")
  const [log, setLog] = useState<LogEntry[]>([])
  const logIdRef = useRef(0)

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "time">) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false })
    logIdRef.current += 1
    const id = logIdRef.current
    setLog((current) => [...current.slice(-(MAX_LOG_ENTRIES - 1)), { ...entry, id, time }])
  }, [])

  const handleDebugEvent = useCallback((event: ExtensionComponentDebugEvent) => {
    if (event.type === ComponentMessageType.Log) {
      addLog({ direction: "console", type: "console", level: String(event.data.level), detail: String(event.data.message) })
      return
    }

    // Theme carries every CSS variable, its name is enough here
    const { source, theme, ...rest } = event.data
    const detail = event.type === HostMessageType.Theme || theme
      ? JSON.stringify({ ...rest, theme: (theme as { name?: string } | undefined)?.name })
      : JSON.stringify(rest)

    addLog({ direction: event.direction, type: event.type, detail })
  }, [addLog])

  // The component set a new value. A frame logs its own message, a built-in
  // component's change is logged here.
  const handleFrameValue = useCallback((next: unknown) => {
    setValue(next)
    setValueText(formatJson(next))
    setValueError(undefined)
    if (!isExtension) {
      addLog({ direction: "in", type: "change", detail: JSON.stringify(next) ?? "undefined" })
    }
  }, [isExtension, addLog])

  const handleValueText = (text: string) => {
    setValueText(text)
    const result = parseJsonOrError(text)
    setValueError(result.error)
    if (result.error === undefined) {
      setValue(result.value)
      handleValueSent(result.value)
    }
  }

  // Props only reach the component when it starts, so a change reloads it
  const handlePropsText = (text: string) => {
    setPropsText(text)
    const result = parseJsonOrError(text)
    if (result.error !== undefined) {
      setPropsError(result.error)
      return
    }
    if (result.value === null || typeof result.value !== "object" || Array.isArray(result.value)) {
      setPropsError("Props must be an object")
      return
    }
    setPropsError(undefined)
    setFieldProps(result.value as Record<string, unknown>)
    setFrameKey((key) => key + 1)
  }

  const handleRestart = () => {
    setFrameKey((key) => key + 1)
    addLog({ direction: "out", type: "restart", detail: isExtension ? "Frame reloaded" : "Component remounted" })
  }

  const handleReloadExtensions = () => {
    void appletStore.reloadExtensions()
  }

  // Only extension components have a folder of their own, on disk in the desktop app
  const componentDiskFolder = isExtension ? target.component.extensionFolder.diskPath : undefined

  const handleReveal = async() => {
    if (isExtension && componentDiskFolder) {
      await fileService.openPathInFileManager(await resolveDiskPath(componentDiskFolder, target.component.folder))
    }
  }

  // Values typed in the Value panel reach the component, but a built-in
  // field's own value never left the frame, so it is logged here
  const handleValueSent = (next: unknown) => {
    if (!isExtension) {
      addLog({ direction: "out", type: "value", detail: JSON.stringify(next) ?? "undefined" })
    }
  }

  const renderPreview = () => {
    const label = firstUsage?.fieldLabel ?? name

    // Fills its place like in a tool, so it gets the same fixed area as the
    // built-in editors
    if (isExtension) {
      return (
        <div className="ComponentPlayground-builtIn">
          <ExtensionComponentFrame
            {...fieldProps}
            key={frameKey}
            fieldKey="preview"
            label={label}
            mode={mode}
            html={target.component.html}
            value={value}
            onValueChange={handleFrameValue}
            onDebugEvent={handleDebugEvent}
            onHeightChange={setHeight}
          />
        </div>
      )
    }

    const appletComponent = mode === "input" ? target.entry.input : target.entry.output
    if (!appletComponent) {
      return null
    }
    const Component = appletComponent.component as FC<Record<string, unknown>>

    // No `component` in the context: its copy and save buttons read the
    // active tab's value, not this preview's
    return (
      <AppletComponentContext.Provider value={{ type: mode, fieldKey: "preview" }}>
        <div className="ComponentPlayground-builtIn">
          <Component
            {...fieldProps}
            key={frameKey}
            fieldKey="preview"
            label={label}
            value={value}
            onValueChange={handleFrameValue}
          />
        </div>
      </AppletComponentContext.Provider>
    )
  }

  const consoleCount = log.filter((entry) => entry.direction === "console" && entry.level === "error").length

  const valueInfo = getValueInfo(mode)
  // Only a value that parsed, a parse error is shown on its own
  const valueMismatch = valueError === undefined ? checkComponentValueStructure(value, valueInfo) : undefined

  const handleInsertExample = () => {
    handleValueText(formatJson(valueInfo.example))
  }

  // Props the component documents, per side like the value
  const propInfos: ComponentPropInfo[] = isExtension
    ? (target.component.definition.props ?? [])
    : ((mode === "input" ? target.entry.input : target.entry.output)?.props ?? [])
  const propsMismatch = propsError === undefined ? checkComponentProps(fieldProps, propInfos) : undefined

  // Adds or resets one prop, keeping the rest of what was typed
  const handleSetProp = (info: ComponentPropInfo) => {
    const result = parseJsonOrError(propsText)
    const current = result.error === undefined && result.value && typeof result.value === "object" && !Array.isArray(result.value)
      ? result.value as Record<string, unknown>
      : {}
    handlePropsText(formatJson({ ...current, [info.name]: getComponentPropStartingValue(info) }))
  }

  /**
   * Rows of documented names under an editor: the props, or the keys of the
   * value. Kept on screen when empty, so the editor keeps its half.
   */
  const renderInfoList = (options: {
    title: string
    infos: ComponentPropInfo[]
    empty: string
    note?: string
    isSet?: (info: ComponentPropInfo) => boolean
    onSet?: (info: ComponentPropInfo) => void
  }) => {
    const { title, infos, empty, note, isSet, onSet } = options

    return (
      <div className="ComponentPlayground-propList">
        <div className="ComponentPlayground-propList-title">{title}</div>
        {note && <div className="ComponentPlayground-propList-note">{note}</div>}
        {infos.length === 0
          ? <div className="ComponentPlayground-propList-empty">{empty}</div>
          : (
            <div className="ComponentPlayground-propList-scrollArea">
              <SimpleBar className="ComponentPlayground-propList-scroll">
                {infos.map((info) => (
                  <div key={info.name} className="ComponentPlayground-prop">
                    <div className="ComponentPlayground-prop-head">
                      <code className="ComponentPlayground-prop-name">{info.name}</code>
                      <span className="ComponentPlayground-prop-type">{ComponentValueTypeLabels[info.type]}</span>
                      {info.required && <span className="ComponentPlayground-prop-required">required</span>}
                      {onSet && (
                        <button type="button" onClick={() => { onSet(info) }}>
                          {isSet?.(info) ? "Reset" : "Add"}
                        </button>
                      )}
                    </div>
                    {info.description && <div className="ComponentPlayground-prop-description">{info.description}</div>}
                    {(info.options !== undefined || info.default !== undefined) && (
                      <div className="ComponentPlayground-prop-meta">
                        {info.default !== undefined && <span>Default <code>{JSON.stringify(info.default)}</code></span>}
                        {info.options && (
                          <div className="ComponentPlayground-prop-options">
                            <span>One of</span>
                            <ul>
                              {info.options.map((option) => (
                                <li key={JSON.stringify(option)}>
                                  <code>{JSON.stringify(option)}</code>
                                  {JSON.stringify(option) === JSON.stringify(info.default) && <span>default</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </SimpleBar>
            </div>
          )}
      </div>
    )
  }

  const renderPropInfos = () => renderInfoList({
    title: "Available props",
    infos: propInfos,
    empty: isExtension
      ? "This component doesn't document any props. List them under \"props\" in its peranti.component.json."
      : "This component takes no props of its own.",
    isSet: (info) => fieldProps[info.name] !== undefined,
    onSet: handleSetProp
  })

  // The keys of an object value, or of each item of an array
  const renderStructure = () => {
    const fields = valueInfo.fields ?? []
    const itemType = valueInfo.itemType ?? (valueInfo.fields ? "object" : undefined)

    const getEmptyText = () => {
      if (valueInfo.type === "array" && itemType) {
        return `A list of ${ComponentValueTypeLabels[itemType]} items.`
      }
      if (valueInfo.type === "object" || valueInfo.type === "array") {
        return isExtension
          ? "Its structure isn't documented. List it under \"value.fields\" in its peranti.component.json."
          : "Its structure isn't fixed, any keys are accepted."
      }
      return `A ${ComponentValueTypeLabels[valueInfo.type]} value, it has no structure.`
    }

    return renderInfoList({
      title: valueInfo.type === "array" ? "Structure of each item" : "Structure",
      infos: fields,
      note: valueInfo.type === "array" && fields.length > 0 ? "A list of objects with these keys" : undefined,
      empty: getEmptyText()
    })
  }
  const renderPanel = () => {
    if (panel === "log") {
      return (
        <div className="ComponentPlayground-log">
          <div className="ComponentPlayground-log-bar">
            <span>{log.length} messages</span>
            <button type="button" onClick={() => { setLog([]) }}>Clear</button>
          </div>
          <div className="ComponentPlayground-log-list">
            {log.length === 0 && <div className="ComponentPlayground-empty">Nothing yet</div>}
            {log.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className={clsx(
                  "ComponentPlayground-log-entry",
                  `is-${entry.direction}`,
                  entry.level && `is-${entry.level}`
                )}
              >
                <span className="ComponentPlayground-log-time">{entry.time}</span>
                <span className="ComponentPlayground-log-direction">
                  {entry.direction === "out" ? "→" : entry.direction === "in" ? "←" : "▸"}
                </span>
                <span className="ComponentPlayground-log-type">{entry.level ?? entry.type}</span>
                <code className="ComponentPlayground-log-detail">{entry.detail}</code>
              </div>
            ))}
          </div>
        </div>
      )
    }

    const isValue = panel === "value"
    const text = isValue ? valueText : propsText
    const handleText = isValue ? handleValueText : handlePropsText
    const error = isValue ? valueError : propsError

    // Re-indents what parses, leaves broken JSON for the user to fix
    const handleFormat = () => {
      const result = parseJsonOrError(text)
      if (result.error === undefined) {
        handleText(formatJson(result.value))
      }
    }

    // A wrong value is still sent, so how the component copes can be tried
    const renderStatus = () => {
      if (error) {
        return <div className="ComponentPlayground-status is-error"><Icons.Warning size={12} aria-hidden />{error}</div>
      }
      const mismatch = isValue ? valueMismatch : propsMismatch
      if (mismatch) {
        return <div className="ComponentPlayground-status is-warning"><Icons.Warning size={12} aria-hidden />{mismatch}</div>
      }
      return <div className="ComponentPlayground-status"><Icons.Check size={12} aria-hidden />Valid JSON</div>
    }

    return (
      <div className="ComponentPlayground-editor">
        <div className="ComponentPlayground-editorBar">
          {isValue
            ? (
              <span className={clsx("ComponentPlayground-typeBadge", `is-${mode}`)}>
                <span>{mode === "input" ? "Sends" : "Accepts"}</span>
                <span>{ComponentValueTypeLabels[valueInfo.type]}</span>
              </span>
            )
            : (
              <span className="ComponentPlayground-typeBadge is-neutral">
                <span>{isExtension ? "peranti.props" : "props"}</span>
                <span>object</span>
              </span>
            )}

          <div className="ComponentPlayground-editorBar-actions">
            {isValue && valueInfo.example !== undefined && (
              <button type="button" onClick={handleInsertExample}>Example</button>
            )}
            {!isValue && (
              <button type="button" onClick={() => { handlePropsText(formatJson(initialProps)) }}>Reset</button>
            )}
            <button type="button" onClick={handleFormat}>Format</button>
          </div>
        </div>

        <div className="ComponentPlayground-editor-body">
          <BaseCodeMirror
            key={panel}
            language="json"
            value={text}
            onChange={handleText}
          />
        </div>

        {renderStatus()}
        {isValue ? renderStructure() : renderPropInfos()}
      </div>
    )
  }

  return (
    <div className="ComponentPlayground">
      <ExtensionDetailsHeader
        name={name}
        suffix={isExtension
          ? `@${target.component.definition.componentId}`
          : `"component": "${target.entry.name}"`}
        subtitle={isExtension ? (target.extension.manifest?.name ?? target.extension.folderName) : "Built-in"}
        chips={[
          { label: `${ExtensionComponentKindLabels[kind]} Component`, tone: "provides" },
          {
            label: `${mode === "input" ? "Sends" : "Accepts"} ${ComponentValueTypeLabels[valueInfo.type]}`,
            title: valueInfo.description
          },
          height !== undefined && {
            label: `Content ${height}px`,
            title: "Height of the component's content, the frame itself fills its place"
          }
        ]}
        description={description}
        actions={(
          <>
            <Button icon={Icons.Refresh} onClick={handleRestart}>{isExtension ? "Restart Frame" : "Remount"}</Button>
            {isExtension && (
              <>
                <Button icon={Icons.Refresh} onClick={handleReloadExtensions}>Reload Files</Button>
                {componentDiskFolder && <Button icon={Icons.Folder} onClick={() => { void handleReveal() }}>Show in Folder</Button>}
              </>
            )}
          </>
        )}
      />

      <div className="ComponentPlayground-toolbar">
        <div className="ComponentPlayground-segmented" role="radiogroup" aria-label="Mode">
          {(["input", "output"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={mode === item}
              className={clsx(mode === item && "active")}
              disabled={kind !== "both" && kind !== item}
              onClick={() => { setMode(item); setFrameKey((key) => key + 1) }}
            >
              As {item === "input" ? "Input" : "Output"}
            </button>
          ))}
        </div>
      </div>

      <div className="ComponentPlayground-body">
        <div className="ComponentPlayground-preview">
          {renderPreview()}
        </div>

        <div className="ComponentPlayground-side">
          <div className="ExtensionDetails-tabs ComponentPlayground-panelTabs" role="tablist">
            {(["value", "props", "log"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={panel === item}
                className={clsx("ExtensionDetails-tab", panel === item && "active")}
                onClick={() => { setPanel(item) }}
              >
                {item === "value" ? "Value" : item === "props" ? "Props" : isExtension ? "Messages" : "Changes"}
                {item === "log" && log.length > 0 && (
                  <span className={clsx("ExtensionDetails-tab-count", consoleCount > 0 && "is-error")}>
                    {consoleCount > 0 ? `${consoleCount} errors` : log.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {renderPanel()}
        </div>
      </div>
    </div>
  )
})
