import { type FC } from "react"

import { HighlightedText } from "src/components/common/HighlightedText"
import { type HistoryComponentProps } from "src/types/AppletHistory"

import "./ColorHistory.scss"

/**
 * A swatch with its CSS color string
 */
export const ColorHistory: FC<HistoryComponentProps> = ({ value, query }) => {
  if (typeof value !== "string" || !value) {
    return null
  }

  return (
    <span className="ColorHistory">
      <span className="ColorHistory-swatch" style={{ backgroundColor: value }} />
      <span className="ColorHistory-value">
        <HighlightedText text={value} query={query} />
      </span>
    </span>
  )
}
