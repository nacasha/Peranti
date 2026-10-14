import { clsx } from "clsx"
import { type ChangeEventHandler, type FC } from "react"

import { Tooltip } from "src/components/common/Tooltip"
import { AccentColors } from "src/constants/accent-colors"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

import "./AccentColorPicker.scss"

export const AccentColorPicker: FC = () => {
  const accentColor = useSelector(() => interfaceStore.accentColor)
  const isCustom = !AccentColors.some((color) => color.value === accentColor)

  const handleCustomChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    interfaceStore.setAccentColor(event.target.value)
  }

  return (
    <div className="AccentColorPicker" role="radiogroup" aria-label="Accent color">
      {AccentColors.map((color) => (
        <Tooltip key={color.value} overlay={color.label}>
          <button
            type="button"
            role="radio"
            aria-checked={accentColor === color.value}
            aria-label={color.label}
            className={clsx("AccentColorPicker-swatch", { active: accentColor === color.value })}
            style={{ backgroundColor: color.value }}
            onClick={() => { interfaceStore.setAccentColor(color.value) }}
          />
        </Tooltip>
      ))}

      {/* Custom colour: the system picker sits invisibly over the swatch.
          Once a custom colour is chosen, the swatch shows it. */}
      <Tooltip overlay={isCustom ? `Custom (${accentColor})` : "Custom"}>
        <label
          className={clsx("AccentColorPicker-swatch custom", { active: isCustom })}
          style={isCustom ? { backgroundColor: accentColor } : undefined}
        >
          {!isCustom && <Icons.Plus size={13} aria-hidden />}
          <input
            type="color"
            aria-label="Custom accent color"
            value={accentColor}
            onChange={handleCustomChange}
          />
        </label>
      </Tooltip>
    </div>
  )
}
