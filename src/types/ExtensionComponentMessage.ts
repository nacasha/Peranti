import { type ComponentMessageType, type ExtensionComponentLogLevels, type HostMessageType } from "src/constants/extension-component-protocol"

import { type ExtensionComponentTheme } from "./ExtensionComponentTheme.ts"
import { type FieldAction } from "./FieldAction.ts"

export type ExtensionComponentMode = "input" | "output"

type Values<T> = T[keyof T]

export type HostMessageTypeName = Values<typeof HostMessageType>
export type ComponentMessageTypeName = Values<typeof ComponentMessageType>
export type ExtensionComponentLogLevel = typeof ExtensionComponentLogLevels[number]

// -----------------------------------------------------------------------------
// App → frame
// -----------------------------------------------------------------------------

export interface HostInitMessage {
  type: typeof HostMessageType.Init
  mode: ExtensionComponentMode
  value: unknown
  readOnly: boolean
  props: Record<string, unknown>
  state: unknown
  running: boolean
  theme: ExtensionComponentTheme
}

export interface HostValueMessage {
  type: typeof HostMessageType.Value
  value: unknown
}

export interface HostReadOnlyMessage {
  type: typeof HostMessageType.ReadOnly
  readOnly: boolean
}

export interface HostRunningMessage {
  type: typeof HostMessageType.Running
  running: boolean
}

export interface HostThemeMessage {
  type: typeof HostMessageType.Theme
  theme: ExtensionComponentTheme
}

export interface HostRunDoneMessage {
  type: typeof HostMessageType.RunDone
  runId: number
  error?: string
}

export interface HostActionMessage {
  type: typeof HostMessageType.Action
  id: string
}

export type HostMessage =
  | HostInitMessage
  | HostValueMessage
  | HostReadOnlyMessage
  | HostRunningMessage
  | HostThemeMessage
  | HostRunDoneMessage
  | HostActionMessage

// -----------------------------------------------------------------------------
// Frame → app
// -----------------------------------------------------------------------------

export interface ComponentReadyMessage {
  type: typeof ComponentMessageType.Ready
}

export interface ComponentChangeMessage {
  type: typeof ComponentMessageType.Change
  value: unknown
}

export interface ComponentResizeMessage {
  type: typeof ComponentMessageType.Resize
  height: number
}

export interface ComponentSetStateMessage {
  type: typeof ComponentMessageType.SetState
  state: unknown
}

export interface ComponentSetActionsMessage {
  type: typeof ComponentMessageType.SetActions
  actions: FieldAction[]
}

export interface ComponentRunMessage {
  type: typeof ComponentMessageType.Run
  runId: number
  values: Record<string, unknown>
}

export interface ComponentOpenToolMessage {
  type: typeof ComponentMessageType.OpenTool
  toolId: string
  values: Record<string, unknown>
}

export interface ComponentOpenFilesMessage {
  type: typeof ComponentMessageType.OpenFiles
  paths: string[]
}

export interface ComponentOpenUrlMessage {
  type: typeof ComponentMessageType.OpenUrl
  url: string
}

export interface ComponentKeyMessage {
  type: typeof ComponentMessageType.Key
  event: "keydown" | "keyup"
  init: KeyboardEventInit
}

export interface ComponentLogMessage {
  type: typeof ComponentMessageType.Log
  level: ExtensionComponentLogLevel
  message: string
}

export type ComponentMessage =
  | ComponentReadyMessage
  | ComponentChangeMessage
  | ComponentResizeMessage
  | ComponentSetStateMessage
  | ComponentSetActionsMessage
  | ComponentRunMessage
  | ComponentOpenToolMessage
  | ComponentOpenFilesMessage
  | ComponentOpenUrlMessage
  | ComponentKeyMessage
  | ComponentLogMessage

/**
 * One handler per message the frame can send, each given that message
 */
export type ComponentMessageHandlers = {
  [Type in ComponentMessageTypeName]: (message: Extract<ComponentMessage, { type: Type }>) => void
}
