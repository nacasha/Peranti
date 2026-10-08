import { type FC } from "react"

import { type HistoryComponentProps } from "src/types/AppletHistory"

import "./ImageHistory.scss"

/**
 * A small thumbnail from an image URL or data URL
 */
export const ImageHistory: FC<HistoryComponentProps> = ({ value }) => {
  if (typeof value !== "string" || !value) {
    return null
  }

  return <img className="ImageHistory" src={value} alt="" loading="lazy" />
}
