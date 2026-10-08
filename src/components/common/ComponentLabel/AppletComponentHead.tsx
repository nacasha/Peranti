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

  const handleClickLabel = () => {
    activeAppletStore.getActiveApplet().maximizeNextField()
  }

  const handleClickSwitcher = (event: React.MouseEvent) => {
    setFields(activeAppletStore.getActiveApplet().getMaximizableFields())

    const rect = switcherRef.current?.getBoundingClientRect()
    show({
      event,
      position: rect ? { x: rect.left, y: rect.bottom + 2 } : undefined
    })
  }

  const handleSelectField = (params: ItemParams<any, MaximizableField>) => {
    const field = params.data
    const isCurrentField = field?.type === maximizedField.type && field?.key === maximizedField.key

    if (field && !isCurrentField) {
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
      const isSelected = field.type === maximizedField.type && field.key === maximizedField.key

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
        {isMaximized
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
            tooltip={isMaximized ? "Restore" : "Maximize"}
            icon={isMaximized ? Icons.NormalScreen : Icons.FullScreen}
            iconSize={13}
            onClick={handleClickMaximize}
          />
        )}
      </div>

      {isMaximized && (
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
