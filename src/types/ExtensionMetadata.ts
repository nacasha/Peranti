export interface ExtensionMetadata {
  actionFile: string
  dependencies: {
    external: string[]
    builtin: string[]
  }
}
