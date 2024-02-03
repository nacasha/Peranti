export class ToolComponent<T = any, B = any> {
  /**
   * Component to be rendered
   */
  readonly component: T

  /**
   * Component for batch mode
   */
  readonly batchComponent?: B

  /**
   * Acceptable upload mime types
   */
  readonly mimes?: string[]

  /**
   * Type of context when put into clipboard
   */
  readonly copyAs?: "text" | "file" | "image"

  /**
   * Type of file when click on `Save Into File` on context enu
   */
  readonly saveAs?: "text" | "image"

  /**
   * Acceptable cliboard content
   */
  readonly pasteFrom?: "text"

  /**
   * Acceptable cliboard content
   */
  readonly pasteFromFileMimes?: string[]

  /**
   * ToolComponent constructor
   *
   * @param options
   */
  constructor(options: {
    component: T
    batchComponent?: B
    mimes?: string[]
    copyAs?: "text" | "file" | "image"
    saveAs?: "text" | "image"
    pasteFrom?: "text"
    pasteFromFileMimes?: string[]
  }) {
    this.component = options.component
    this.batchComponent = options.batchComponent
    this.mimes = options.mimes
    this.copyAs = options.copyAs
    this.saveAs = options.saveAs
    this.pasteFrom = options.pasteFrom
    this.pasteFromFileMimes = options.pasteFromFileMimes
  }
}
