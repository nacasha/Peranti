import { useContext, useId, useRef, useState, type FC, memo } from "react"
import { Item, type ItemParams, Menu, Separator, useContextMenu } from "react-contexify"

import { Icons } from "src/constants/icons"
import { AppletComponentContext } from "src/contexts/AppletInputContext"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { runViewTransition } from "src/utils/run-view-transition"

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
        {showMaximize && (
          <ButtonIcon
            tooltip={isMaximized ? "Restore" : "Maximize"}
            icon={isMaximized ? Icons.NormalScreen : Icons.FullScreen}
            iconSize={12}
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
