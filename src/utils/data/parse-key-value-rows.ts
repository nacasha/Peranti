export interface KeyValueRow {
  label: string
  value: string | number
}

export type KeyValueValues = Record<string, string | number>

export type KeyValueFields = Record<string, { label: string }>

/**
 * Rows built from a values object (or its JSON string). Rows follow the order of
 * `fields`, a key with no value gets an empty one. Without `fields`, every key is a row.
 */
export function parseKeyValueRows(value: unknown, fields?: KeyValueFields): KeyValueRow[] {
  let values = value

  if (typeof values === "string") {
    try {
      values = JSON.parse(values)
    } catch {
      values = {}
    }
  }

  const record: KeyValueValues = values && typeof values === "object" && !Array.isArray(values)
    ? values as KeyValueValues
    : {}

  const keys = fields ? Object.keys(fields) : Object.keys(record)

  return keys.map((key) => ({
    label: fields?.[key]?.label ?? key,
    value: record[key] ?? ""
  }))
}
