import { useContext, useEffect, useId, useRef, useState, type FC, memo } from "react"
import { Item, type ItemParams, Menu, Separator, useContextMenu } from "react-contexify"

import { Icons } from "src/constants/icons"
import { AppletComponentContext } from "src/contexts/AppletInputContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { copyComponentValue } from "src/utils/copy-component-value"
import { runViewTransition } from "src/utils/run-view-transition"
import { saveComponentValue } from "src/utils/save-component-value"

import { Button } from "../Button"
import { ButtonIcon } from "../ButtonIcon"
import { PopoverConfirm } from "../PopoverConfirm"
import { Tooltip } from "../Tooltip"

import "./AppletComponentHead.scss"

interface AppletComponentHeadProps {
  label?: string
  showMaximize?: boolean
}

type MaximizableField = ReturnType<ReturnType<typeof activeAppletStore.getActiveApplet>["getMaximizableFields"]>[number]

export const AppletComponentHead: FC<AppletComponentHeadProps> = memo((props) => {
  const { label, showMaximize } = props
  const componentContext = useContext(AppletComponentContext)

  const menuId = useId()
  const { show } = useContextMenu({ id: menuId })
  const switcherRef = useRef<HTMLDivElement>(null)
  const [fields, setFields] = useState<MaximizableField[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => { clearTimeout(copiedTimeoutRef.current) }, [])

  const maximizedField = useSelector(() => activeAppletStore.getActiveApplet().maximizedField)
  const isMaximized = maximizedField.enabled &&
    maximizedField.type === componentContext.type &&
    maximizedField.key === componentContext.fieldKey

  /**
   * Maximize scales the input / output area up, restore scales it down,
   * switching fields is instant
   */
  const handleClickMaximize = () => {
    runViewTransition(() => {
      activeAppletStore.getActiveApplet().toggleMaximizedFieldKey({
        enabled: true,
        type: componentContext.type,
        key: componentContext.fieldKey
      })
    }, isMaximized ? "field-restoring" : "field-maximizing")
  }

  const getFieldValue = () => {
    const applet = activeAppletStore.getActiveApplet()

    return componentContext.type === "output"
      ? applet.getOutputValue(componentContext.fieldKey)
      : applet.getInputValue(componentContext.fieldKey)
  }

  const handleClickCopy = async() => {
    if (!componentContext.component) {
      return
    }

    const isSuccess = await copyComponentValue(componentContext.component, getFieldValue())
    if (isSuccess) {
      clearTimeout(copiedTimeoutRef.current)
      setIsCopied(true)
      copiedTimeoutRef.current = setTimeout(() => { setIsCopied(false) }, 1500)
    }
  }

  const handleClickSave = () => {
    if (componentContext.component) {
      void saveComponentValue(componentContext.component, getFieldValue())
    }
  }

  const isActionRunning = useSelector(() => activeAppletStore.getActiveApplet().isActionRunning)

  const handleClickRegenerate = () => {
    void activeAppletStore.getActiveApplet().run()
  }

  const isBatchModeEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)

  const handleClickBatchMode = () => {
    activeAppletStore.toggleBatchMode()
  }

  const batchModeOutputKey = useSelector(() => activeAppletStore.getActiveApplet().batchModeOutputKey)

  const getBatchOutputFields = (): MaximizableField[] => activeAppletStore.getActiveApplet()
    .getOutputFields()
    .filter((output) => output.allowBatch)
    .map((output) => ({ type: "output", key: output.key, label: output.label }))

  /**
   * Batch mode shows a single output, so offer the same switcher as maximized
   * fields when more than one output allows batch
   */
  const isBatchOutputSwitcher = !isMaximized &&
    isBatchModeEnabled &&
    componentContext.type === "output" &&
    getBatchOutputFields().length > 1
  const hasSwitcher = isMaximized || isBatchOutputSwitcher
  const selectedField = isBatchOutputSwitcher
    ? { type: "output", key: batchModeOutputKey }
    : maximizedField

  const handleClickLabel = () => {
    if (isBatchOutputSwitcher) {
      const batchFields = getBatchOutputFields()
      const currentIndex = batchFields.findIndex((field) => field.key === batchModeOutputKey)
      const nextField = batchFields[(currentIndex + 1) % batchFields.length]
      activeAppletStore.getActiveApplet().setBatchModeOutputKey(nextField.key)
      return
    }

    activeAppletStore.getActiveApplet().maximizeNextField()
  }

  const handleClickSwitcher = (event: React.MouseEvent) => {
    setFields(isBatchOutputSwitcher
      ? getBatchOutputFields()
      : activeAppletStore.getActiveApplet().getMaximizableFields())

    const rect = switcherRef.current?.getBoundingClientRect()
    show({
      event,
      position: rect ? { x: rect.left, y: rect.bottom + 2 } : undefined
    })
  }

  const handleSelectField = (params: ItemParams<any, MaximizableField>) => {
    const field = params.data
    const isCurrentField = field?.type === selectedField.type && field?.key === selectedField.key

    if (field && !isCurrentField) {
      if (isBatchOutputSwitcher) {
        activeAppletStore.getActiveApplet().setBatchModeOutputKey(field.key)
        return
      }

      activeAppletStore.getActiveApplet().toggleMaximizedFieldKey({
        enabled: true,
        type: field.type,
        key: field.key
      })
    }
  }

  const renderFieldItems = (type: string) => fields
    .filter((field) => field.type === type)
    .map((field) => {
      const isSelected = field.type === selectedField.type && field.key === selectedField.key

      return (
        <Item
          key={`${field.type}-${field.key}`}
          data={field}
          onClick={handleSelectField}
          className={isSelected ? "selected" : ""}
        >
          <span className="DropdownMenu-label">{field.label}</span>
          {isSelected && <Icons.Check className="DropdownMenu-check" size={14} aria-hidden />}
        </Item>
      )
    })

  const hasInputFields = fields.some((field) => field.type === "input")
  const hasOutputFields = fields.some((field) => field.type === "output")

  return (
    <div className="AppletComponentHead">
      <div className="AppletComponentHead-title">
        {hasSwitcher
          ? (
            <div className="AppletComponentHead-switch" ref={switcherRef}>
              <Tooltip overlay="Select input / output">
                <button
                  className="AppletComponentHead-switchToggle"
                  aria-label="Select input / output"
                  aria-haspopup="true"
                  onClick={handleClickSwitcher}
                >
                  <Icons.ChevronDown size={14} aria-hidden />
                </button>
              </Tooltip>
              <Tooltip overlay="Switch to next input / output">
                <button className="AppletComponentHead-switchLabel" onClick={handleClickLabel}>
                  <span className="AppletComponentHead-label">{label}</span>
                </button>
              </Tooltip>
            </div>
          )
          : (
            <label className="AppletComponentHead-label">
              {label}
            </label>
          )}
        {componentContext.type === "output" && (
          <span className="AppletComponentHead-badge">Read-only</span>
        )}
      </div>
      <div className="AppletComponentHead-buttons">
        {componentContext.showBatchModeButton && (
          <PopoverConfirm
            confirmation={() => activeAppletStore.getToggleBatchModeConfirmation()}
            onConfirm={handleClickBatchMode}
          >
            <Button
              className={isBatchModeEnabled ? "AppletComponentHead-batch is-active" : "AppletComponentHead-batch"}
              icon={Icons.Layers}
              iconSize={13}
              onClick={handleClickBatchMode}
            >
              Batch
            </Button>
          </PopoverConfirm>
        )}
        {componentContext.showRegenerateButton && (
          <Button
            className="AppletComponentHead-regenerate"
            icon={Icons.Run}
            iconSize={13}
            onClick={handleClickRegenerate}
            disabled={isActionRunning}
          >
            Regenerate
          </Button>
        )}
        {componentContext.component?.copyAs && (
          <ButtonIcon
            className={isCopied ? "ButtonIcon is-copied" : "ButtonIcon"}
            tooltip={isCopied ? "Copied" : "Copy"}
            icon={isCopied ? Icons.Check : Icons.Copy}
            iconSize={13}
            onClick={() => { void handleClickCopy() }}
          />
        )}
        {componentContext.component?.saveAs && (
          <ButtonIcon
            tooltip="Save to File"
            icon={Icons.SaveToFile}
            iconSize={13}
            onClick={handleClickSave}
          />
        )}
        {showMaximize && (
          <ButtonIcon
            className={isMaximized ? "ButtonIcon is-restore" : "ButtonIcon"}
            tooltip={isMaximized ? "Restore" : "Maximize"}
            icon={isMaximized ? Icons.NormalScreen : Icons.FullScreen}
            iconSize={13}
            onClick={handleClickMaximize}
          />
        )}
      </div>

      {hasSwitcher && (
        <Menu id={menuId} className="DropdownMenu AppletComponentHead-menu">
          {hasInputFields && <Item disabled className="AppletComponentHead-menuGroup">Inputs</Item>}
          {renderFieldItems("input")}
          {hasInputFields && hasOutputFields && <Separator />}
          {hasOutputFields && <Item disabled className="AppletComponentHead-menuGroup">Outputs</Item>}
          {renderFieldItems("output")}
        </Menu>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.label === nextProps.label
})
