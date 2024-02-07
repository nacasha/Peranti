export interface LayoutSetting {
  /**
   * Switch position between input area and output area, default is false
   */
  reversed?: boolean

  /**
   * Layout direction of tool area, default is horizontal
   */
  direction?: "horizontal" | "vertical"

  /**
   * Grid template for tool area, default is "1fr 1fr"
   */
  gridTemplate?: string

  /**
   * Input area layout direction, default is vertical
   */
  inputAreaDirection?: "horizontal" | "vertical"

  /**
   * Output area layout direction, default is vertical
   */
  outputAreaDirection?: "horizontal" | "vertical"
}