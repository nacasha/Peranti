const HASH_MULTIPLIER = 31
const DEGREES_IN_CIRCLE = 360

/**
 * Picks a stable hue (0-359) for a file extension so each file type keeps the
 * same badge tint between drops, without hardcoding a palette for every format
 * out there.
 */
export function getFileTypeHue(fileExtension: string) {
  let hash = 0

  for (let index = 0; index < fileExtension.length; index++) {
    hash = (hash * HASH_MULTIPLIER + fileExtension.charCodeAt(index)) % DEGREES_IN_CIRCLE
  }

  return hash
}
