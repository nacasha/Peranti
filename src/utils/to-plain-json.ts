/**
 * Plain copy of a value that can cross `postMessage`: mobx proxies become
 * plain objects and arrays, functions and other values JSON can't hold are
 * dropped. `undefined` stays `undefined`.
 */
export function toPlainJson<T>(value: T): T {
  if (value === undefined) {
    return value
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    // Circular or otherwise unserializable, the frame gets nothing
    return undefined as T
  }
}
