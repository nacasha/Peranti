import { useContext, useEffect, useId, useRef, useState, type FC, memo } from "react"
import { Item, type ItemParams, Menu, Separator, useContextMenu } from "react-contexify"

import { type Icon, Icons } from "src/constants/icons"
import { AppletComponentContext } from "src/contexts/AppletComponentContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { type FieldAction, RUN_FIELD_ACTION, sanitizeFieldActions } from "src/types/FieldAction"
import { copyComponentValue } from "src/utils/component/copy-component-value"
import { saveComponentValue } from "src/utils/component/save-component-value"
import { runViewTransition } from "src/utils/theme/run-view-transition"

import { Button } from "../Button"
import { ButtonIcon } from "../ButtonIcon"
import { PopoverConfirm } from "../PopoverConfirm"
import { Tooltip } from "../Tooltip"

import "./AppletComponentHead.scss"

interface AppletComponentHeadProps {
  label?: string
  showMaximize?: boolean

  /**
   * Buttons an extension component asked for, drawn after the field's own
   * `actions`
   */
  actions?: FieldAction[]

  /**
   * Called for a button whose id isn't `run`, from either list
   */
  onAction?: (id: string) => void
}

type MaximizableField = ReturnType<ReturnType<typeof activeAppletStore.getActiveApplet>["getMaximizableFields"]>[number]

export const AppletComponentHead: FC<AppletComponentHeadProps> = memo((props) => {
  const { label, showMaximize, actions: componentActions, onAction } = props
  const componentContext = useContext(AppletComponentContext)

  // The field's actions win over a component's with the same id
  const actions = sanitizeFieldActions([...(componentContext.actions ?? []), ...(componentActions ?? [])])

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

  const isBatchModeEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)

  const fieldError = useSelector(() => (
    componentContext.fieldKey
      ? activeAppletStore.getActiveApplet().getFieldError(componentContext.type, componentContext.fieldKey)
      : undefined
  ))

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
        {fieldError && (
          <Tooltip overlay={fieldError}>
            <span className="AppletComponentHead-badge is-error" role="status" aria-label={fieldError}>
              <Icons.Warning size={11} aria-hidden />
              Error
            </span>
          </Tooltip>
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
        {componentContext.showRegenerateButton && <RegenerateButton />}
        {actions.map((action) => (
          <FieldActionButton key={action.id} action={action} onAction={onAction} />
        ))}
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
  return prevProps.label === nextProps.label &&
    prevProps.showMaximize === nextProps.showMaximize &&
    prevProps.onAction === nextProps.onAction &&
    JSON.stringify(prevProps.actions) === JSON.stringify(nextProps.actions)
})

/**
 * Own component so `isActionRunning` flipping on every run only re-renders
 * this button, not the whole head
 */
const RegenerateButton: FC = () => {
  const isActionRunning = useSelector(() => activeAppletStore.getActiveApplet().isActionRunning)

  const handleClickRegenerate = () => {
    void activeAppletStore.getActiveApplet().run()
  }

  return (
    <Button
      className="AppletComponentHead-regenerate"
      icon={Icons.Run}
      iconSize={13}
      onClick={handleClickRegenerate}
      disabled={isActionRunning}
    >
      Regenerate
    </Button>
  )
}

/**
 * One of a field's `actions`. `run` runs the tool and waits for it, like
 * Regenerate, any other id is passed to `onAction`
 */
const FieldActionButton: FC<{ action: FieldAction, onAction?: (id: string) => void }> = ({ action, onAction }) => {
  const isRun = action.id === RUN_FIELD_ACTION
  const isActionRunning = useSelector(() => isRun && activeAppletStore.getActiveApplet().isActionRunning)
  const namedIcon = action.icon ? (Icons as Record<string, Icon | undefined>)[action.icon] : undefined
  const ActionIcon = namedIcon ?? (isRun ? Icons.Run : undefined)
  const isDisabled = action.disabled === true || isActionRunning || (!isRun && !onAction)
  const tooltip = action.tooltip ?? action.label ?? action.id

  const handleClick = () => {
    if (isDisabled) {
      return
    }
    if (isRun) {
      void activeAppletStore.getActiveApplet().run()
    } else {
      onAction?.(action.id)
    }
  }

  if (!action.label && ActionIcon) {
    return (
      <ButtonIcon
        className={action.active ? "ButtonIcon is-active" : "ButtonIcon"}
        tooltip={tooltip}
        icon={ActionIcon}
        iconSize={13}
        disabled={isDisabled}
        onClick={handleClick}
      />
    )
  }

  return (
    <Button
      className={action.active ? "AppletComponentHead-action is-active" : "AppletComponentHead-action"}
      icon={ActionIcon}
      iconSize={13}
      title={action.tooltip}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {action.label ?? action.id}
    </Button>
  )
}
