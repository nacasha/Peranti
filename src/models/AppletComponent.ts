import { type FC } from "react"

import { type HistoryComponentProps } from "src/types/AppletHistory"

export class AppletComponent<T = any, B = any> {
  /**
   * Main component
   */
  readonly component: T

  /**
   * Batch mode component
   */
  readonly batchComponent?: B

  /**
   * Type of content will be put into clipboard
   */
  readonly copyAs?: "text" | "file" | "image"

  /**
   * Type of content when saving into file
   */
  readonly saveAs?: "text" | "image"

  readonly pasteFrom?: "text"

  readonly readFileAs?: "text" | "file" | "files"

  /**
   * Component can be maximized to fill the applet area
   */
  readonly maximizable?: boolean

  /**
   * Draws the value in one line of the history list, e.g. a swatch for a
   * color. Without it, the value is shown as text.
   */
  readonly historyComponent?: FC<HistoryComponentProps>

  /**
   * Never shown in the history list, e.g. controls whose value means nothing
   * without their label. A single field can opt out with its own `hideInHistory`.
   */
  readonly hideInHistory?: boolean

  constructor(options: {
    component: T
    batchComponent?: B
    copyAs?: "text" | "file" | "image"
    saveAs?: "text" | "image"
    pasteFrom?: "text"
    readFileAs?: "text" | "file" | "files"
    maximizable?: boolean
    historyComponent?: FC<HistoryComponentProps>
    hideInHistory?: boolean
  }) {
    this.historyComponent = options.historyComponent
    this.hideInHistory = options.hideInHistory
    this.maximizable = options.maximizable
    this.component = options.component
    this.batchComponent = options.batchComponent
    this.copyAs = options.copyAs
    this.saveAs = options.saveAs
    this.pasteFrom = options.pasteFrom
    this.readFileAs = options.readFileAs
  }
}
