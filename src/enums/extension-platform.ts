/**
 * Where an extension can run
 */
export enum ExtensionPlatform {
  /**
   * Has a tool that runs a program, so it needs the desktop app
   */
  Desktop = "desktop",

  /**
   * Every tool is JavaScript, so it runs in the browser too
   */
  Web = "web",
}
