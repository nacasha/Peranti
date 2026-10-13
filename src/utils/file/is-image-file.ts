import { getFileExtension } from "./get-file-extension.js"

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg", "ico"]

/**
 * Whether a file can be previewed as an image. Files read from a dropped path
 * carry no MIME type, so the extension is checked as well.
 */
export function isImageFile(file: File) {
  return file.type.startsWith("image/") || IMAGE_EXTENSIONS.includes(getFileExtension(file.name))
}
