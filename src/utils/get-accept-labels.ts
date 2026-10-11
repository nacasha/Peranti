/**
 * Turns an `accept` attribute (".json,application/json,image/*") into the short
 * uppercase labels shown as file type chips, e.g. ["JSON", "IMAGE"]. MIME types
 * that only repeat an extension already listed collapse into one label.
 */
export function getAcceptLabels(accept: string) {
  const labels = accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith(".")) {
        return part.slice(1)
      }

      const [type, subtype = ""] = part.split("/")

      return subtype === "*" ? type : subtype
    })
    .map((label) => label.toUpperCase())

  return [...new Set(labels)]
}
