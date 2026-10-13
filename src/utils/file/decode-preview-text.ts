/**
 * Bytes of a file as UTF-8 text for a preview, or undefined when it looks
 * binary (a NUL byte within the first 8 KB)
 */
export function decodePreviewText(bytes: Uint8Array): string | undefined {
  if (bytes.subarray(0, 8192).includes(0)) {
    return undefined
  }

  return new TextDecoder("utf-8").decode(bytes)
}
