import {
  ComponentMessageType,
  ExtensionComponentLimits,
  ExtensionComponentLogLevels,
  ExtensionComponentUrlProtocols,
  ExtensionMessageSource
} from "src/constants/extension-component-protocol"
import {
  type ComponentMessage,
  type ComponentMessageTypeName,
  type ExtensionComponentLogLevel
} from "src/types/ExtensionComponentMessage"
import { sanitizeFieldActions } from "src/types/FieldAction"
import { toPlainJson } from "src/utils/data/to-plain-json"

type RawMessage = Record<string, unknown>

const KEY_EVENTS = ["keydown", "keyup"] as const

const isRecord = (value: unknown): value is RawMessage => (
  typeof value === "object" && value !== null && !Array.isArray(value)
)

const isString = (value: unknown): value is string => typeof value === "string"

const asPlainRecord = (value: unknown): Record<string, unknown> => {
  const plain = toPlainJson(value)
  return isRecord(plain) ? plain : {}
}

/**
 * The URL when it's a web page address, normalised
 */
const parseWebUrl = (value: string): string | undefined => {
  try {
    const url = new URL(value)
    return (ExtensionComponentUrlProtocols as readonly string[]).includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

/**
 * Checks one message type's fields, returning the message to handle or
 * undefined to drop it
 */
const parsers: { [Type in ComponentMessageTypeName]: (data: RawMessage) => Extract<ComponentMessage, { type: Type }> | undefined } = {
  [ComponentMessageType.Ready]: () => ({ type: ComponentMessageType.Ready }),

  [ComponentMessageType.Change]: (data) => ({ type: ComponentMessageType.Change, value: toPlainJson(data.value) }),

  [ComponentMessageType.Resize]: (data) => {
    if (typeof data.height !== "number" || !Number.isFinite(data.height)) {
      return undefined
    }

    const height = Math.min(Math.max(Math.ceil(data.height), 0), ExtensionComponentLimits.maxContentHeight)
    return { type: ComponentMessageType.Resize, height }
  },

  [ComponentMessageType.SetState]: (data) => {
    const json = JSON.stringify(data.state ?? null)
    if (json.length > ExtensionComponentLimits.maxStateLength) {
      return undefined
    }

    return { type: ComponentMessageType.SetState, state: JSON.parse(json) }
  },

  [ComponentMessageType.SetActions]: (data) => ({
    type: ComponentMessageType.SetActions,
    actions: sanitizeFieldActions(data.actions)
  }),

  [ComponentMessageType.Run]: (data) => {
    if (typeof data.runId !== "number") {
      return undefined
    }

    return { type: ComponentMessageType.Run, runId: data.runId, values: asPlainRecord(data.values) }
  },

  [ComponentMessageType.OpenTool]: (data) => {
    if (!isString(data.toolId) || !data.toolId) {
      return undefined
    }

    return { type: ComponentMessageType.OpenTool, toolId: data.toolId, values: asPlainRecord(data.values) }
  },

  [ComponentMessageType.OpenFiles]: (data) => {
    const paths = Array.isArray(data.paths) ? data.paths.filter((path): path is string => isString(path) && path !== "") : []
    return paths.length > 0 ? { type: ComponentMessageType.OpenFiles, paths } : undefined
  },

  [ComponentMessageType.OpenUrl]: (data) => {
    const url = isString(data.url) ? parseWebUrl(data.url) : undefined
    return url ? { type: ComponentMessageType.OpenUrl, url } : undefined
  },

  [ComponentMessageType.Key]: (data) => {
    const event = KEY_EVENTS.find((name) => name === data.event)
    const init = isRecord(data.init) ? data.init : undefined
    if (!event || !init || !isString(init.key)) {
      return undefined
    }

    return {
      type: ComponentMessageType.Key,
      event,
      init: {
        key: init.key,
        code: isString(init.code) ? init.code : "",
        ctrlKey: init.ctrlKey === true,
        metaKey: init.metaKey === true,
        shiftKey: init.shiftKey === true,
        altKey: init.altKey === true,
        repeat: init.repeat === true
      }
    }
  },

  [ComponentMessageType.Log]: (data) => {
    const level = ExtensionComponentLogLevels.find((name) => name === data.level) ?? "log"
    return { type: ComponentMessageType.Log, level: level as ExtensionComponentLogLevel, message: String(data.message) }
  }
}

const isComponentMessageType = (type: unknown): type is ComponentMessageTypeName => (
  isString(type) && Object.prototype.hasOwnProperty.call(parsers, type)
)

/**
 * A message posted by a component frame, checked field by field since the
 * frame runs third-party code. Undefined when it isn't a well-formed
 * component message.
 */
export function parseComponentMessage(data: unknown): ComponentMessage | undefined {
  if (!isRecord(data) || data.source !== ExtensionMessageSource.Component || !isComponentMessageType(data.type)) {
    return undefined
  }

  const parse = parsers[data.type] as (data: RawMessage) => ComponentMessage | undefined
  return parse(data)
}
