export enum ExtensionRuntime {
  /**
   * Pure JavaScript run in a Web Worker, works on desktop and browser
   */
  JavaScript = "javascript",

  /**
   * Any binary (node, python3, bash, ...) run as a child process, desktop only
   */
  Executable = "executable",
}
