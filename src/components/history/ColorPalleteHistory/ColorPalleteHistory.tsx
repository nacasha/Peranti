import { type FC } from "react"

import { type HistoryComponentProps } from "src/types/AppletHistory"

import "./ColorPalleteHistory.scss"

/**
 * Swatches shown at most, the rest counted
 */
const MAX_SWATCHES = 8

/**
 * A row of swatches from an array of CSS color strings, or a single one
 */
export const ColorPalleteHistory: FC<HistoryComponentProps> = ({ value }) => {
  const colors = (Array.isArray(value) ? value : [value])
    .filter((color): color is string => typeof color === "string" && color !== "")

  if (colors.length === 0) {
    return null
  }

  return (
    <span className="ColorPalleteHistory">
      {colors.slice(0, MAX_SWATCHES).map((color, index) => (
        <span
          key={index}
          className="ColorPalleteHistory-swatch"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      {colors.length > MAX_SWATCHES && (
        <span className="ColorPalleteHistory-more">+{colors.length - MAX_SWATCHES}</span>
      )}
    </span>
  )
}
