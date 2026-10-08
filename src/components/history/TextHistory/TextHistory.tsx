import { type FC } from "react"

import { HighlightedText } from "src/components/common/HighlightedText"
import { type HistoryComponentProps } from "src/types/AppletHistory"
import { toPreviewText } from "src/utils/to-preview-text"

import "./TextHistory.scss"

/**
 * One line of the value: strings as they are, everything else as JSON.
 * Used for every component without a history component of its own.
 */
export const TextHistory: FC<HistoryComponentProps> = ({ value, query }) => {
  const text = toPreviewText(value)
  if (!text) {
    return null
  }

  return (
    <span className="TextHistory">
      <HighlightedText text={text} query={query} />
    </span>
  )
}
