export interface ToolLayoutSetting {
  /**
   * Switch position between input area and output area, default is false
   */
  reversed?: boolean

  /**
   * Layout direction of tool area, default is horizontal
   */
  direction?: "horizontal" | "vertical"

  /**
   * Input area size, default is 1fr
   */
  inputAreaSize?: string

  /**
   * Output area size, deafult is 1fr
   */
  outputAreaSize?: string

  /**
   * Input area layout direction, default is vertical
   */
  inputAreaDirection?: "horizontal" | "vertical"

  /**
   * Output area layout direction, default is vertical
   */
  outputAreaDirection?: "horizontal" | "vertical"
}
