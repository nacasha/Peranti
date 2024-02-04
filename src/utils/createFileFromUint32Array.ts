import mime from "mime"

const defaultType = "application/octet-stream"

export function createFileFromUint32Array(uint32Array: Uint8Array, filePath: string) {
  // Convert Uint32Array to Uint8Array
  const uint8Array = new Uint8Array(uint32Array.buffer)

  // Create a Blob from the Uint8Array
  const blob = new Blob([uint8Array], { type: mime.getType(filePath) ?? defaultType })

  // Create a File from the Blob
  const fileName = filePath.replace(/^.*[\\/]/, "")
  const file = new File([blob], fileName, { type: mime.getType(filePath) ?? defaultType })

  return file
}
