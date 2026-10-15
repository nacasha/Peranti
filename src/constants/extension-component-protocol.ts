/**
 * Messages between the app (host) and an extension component's frame.
 *
 * Both sides read these names: the host imports them, and the frame's bridge
 * script is handed them when it's built, see `getExtensionComponentBridgeScript`.
 * The shape of each message is in `src/types/ExtensionComponentMessage`.
 */

/**
 * Tag on every message, so each side only reads the other's
 */
export const ExtensionMessageSource = {
  Host: "peranti-host",
  Component: "peranti-component"
} as const

/**
 * Sent by the app to the frame
 */
export const HostMessageType = {
  /**
   * Answers `Ready` with everything the component starts with
   */
  Init: "init",
  Value: "value",
  ReadOnly: "readOnly",
  Running: "running",
  Theme: "theme",

  /**
   * A run the component asked for has ended
   */
  RunDone: "run-done",

  /**
   * A header button the component added was clicked
   */
  Action: "action"
} as const

/**
 * Sent by the frame to the app
 */
export const ComponentMessageType = {
  /**
   * The bridge is loaded, waiting for `Init`
   */
  Ready: "ready",
  Change: "change",
  Resize: "resize",
  SetState: "set-state",
  SetActions: "set-actions",
  Run: "run",
  OpenTool: "open-tool",
  OpenFiles: "open-files",
  OpenUrl: "open-url",

  /**
   * A shortcut pressed in the frame, replayed in the app for its hotkeys
   */
  Key: "key",

  /**
   * Console output and uncaught errors, shown in the component playground
   */
  Log: "log"
} as const

export const ExtensionComponentLimits = {
  /**
   * Largest state, as JSON, a component can keep with `peranti.setState`
   */
  maxStateLength: 64 * 1024,

  /**
   * Tallest a component can make its field by its content, so a runaway
   * layout can't push the rest of the tool away
   */
  maxContentHeight: 1600
} as const

/**
 * Console methods the bridge forwards as `Log` messages
 */
export const ExtensionComponentLogLevels = ["log", "info", "warn", "error", "debug"] as const

/**
 * URL schemes `peranti.openUrl` may open, web pages only
 */
export const ExtensionComponentUrlProtocols = ["http:", "https:"] as const
