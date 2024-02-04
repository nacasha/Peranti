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
   * Acceptable upload mime types
   */
  readonly readFileMimes?: string[]

  /**
   * Type of context will be read when dropping files
   */
  readonly readFileAs?: "text" | "file"

  /**
   * ToolComponent constructor
   *
   * @param options
   */
  constructor(options: {
    component: T
    batchComponent?: B
    copyAs?: "text" | "file" | "image"
    saveAs?: "text" | "image"
    pasteFrom?: "text"
    readFileMimes?: string[]
    readFileAs?: "text" | "file"
  }) {
    this.component = options.component
    this.batchComponent = options.batchComponent
    this.copyAs = options.copyAs
    this.saveAs = options.saveAs
    this.pasteFrom = options.pasteFrom
    this.readFileMimes = options.readFileMimes
    this.readFileAs = options.readFileAs
  }
}
