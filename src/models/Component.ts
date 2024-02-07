export class Component<T = any, B = any> {
  readonly component: T

  readonly batchComponent?: B

  readonly copyAs?: "text" | "file" | "image"

  readonly saveAs?: "text" | "image"

  readonly pasteFrom?: "text"

  readonly readFileMimes?: string[]

  readonly readFileAs?: "text" | "file"

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
