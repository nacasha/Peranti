import { type FC } from "react"

/**
 * Props of a component's history renderer (`historyComponent`), which draws
 * a field's value in one line of the history list
 */
export interface HistoryComponentProps {
  value: unknown

  /**
   * Search keyword to highlight, while searching
   */
  query?: string
}

/**
 * A field shown for a closed tab in the history list, resolved from the
 * applet's fields and their components. Without a `Component`, the value is
 * drawn as one line of text.
 */
export interface HistoryPreviewField {
  source: "input" | "output"
  key: string
  Component?: FC<HistoryComponentProps>
}
