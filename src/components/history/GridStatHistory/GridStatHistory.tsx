import { type FC } from "react"

import { type HistoryComponentProps } from "src/types/AppletHistory"

import { TextHistory } from "../TextHistory"

interface Stat {
  label: string | number
  value: string | number
}

/**
 * "Label value" pairs on one line, e.g. "Characters 120 · Words 18"
 */
export const GridStatHistory: FC<HistoryComponentProps> = ({ value, query }) => {
  let stats: Stat[] = []

  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value
    stats = Array.isArray(parsed) ? parsed : []
  } catch {
    stats = []
  }

  if (stats.length === 0) {
    return null
  }

  return (
    <TextHistory
      value={stats.map((stat) => `${stat.label} ${stat.value}`).join(" · ")}
      query={query}
    />
  )
}
