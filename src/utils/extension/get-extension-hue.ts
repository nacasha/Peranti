/**
 * Picks a stable hue (0-359) for a file extension so each file type keeps the
 * same badge tint between drops, without hardcoding a palette for every format
 * out there.
 */
export function getExtensionHue(extension: string) {
  let hash = 0

  for (let index = 0; index < extension.length; index++) {
    hash = (hash * 31 + extension.charCodeAt(index)) % 360
  }

  return hash
}
