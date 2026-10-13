/**
 * "2 inputs · 1 output" for a tool's fields, counting only array fields.
 * Undefined when it has neither.
 */
export function getFieldCountSummary(inputFields: unknown, outputFields: unknown) {
  const parts = [
    { count: Array.isArray(inputFields) ? inputFields.length : 0, label: "input" },
    { count: Array.isArray(outputFields) ? outputFields.length : 0, label: "output" }
  ]
    .filter((part) => part.count > 0)
    .map((part) => `${part.count} ${part.label}${part.count === 1 ? "" : "s"}`)

  return parts.length > 0 ? parts.join(" · ") : undefined
}
