import { type FC } from "react"

import { Icons } from "src/constants/icons"
import { type HistoryComponentProps } from "src/types/AppletHistory"

import { TextHistory } from "../TextHistory"

import "./FileHistory.scss"

/**
 * File inputs: the file name(s), since the file itself can't be previewed
 * in a line
 */
export const FileHistory: FC<HistoryComponentProps> = ({ value, query }) => {
  const names = (Array.isArray(value) ? value : [value])
    .map((file) => (file instanceof File ? file.name : (file as { name?: unknown } | undefined)?.name))
    .filter((name): name is string => typeof name === "string" && name !== "")

  if (names.length === 0) {
    return null
  }

  return (
    <span className="FileHistory" title={names.join(", ")}>
      <Icons.Documents size={12} aria-hidden />
      <TextHistory
        value={names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0]}
        query={query}
      />
    </span>
  )
}
