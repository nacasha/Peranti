import { HISTORY_BLOB_KEY, type HistoryBlobPlaceholder } from "src/types/SessionHistory"

/**
 * Copy of `value` with each placeholder left by `extractBinaryValues` turned
 * back into its file or buffer, the bytes coming from `loadBlob`
 */
export async function restoreBinaryValues<T>(value: T, loadBlob: (blobId: string) => Promise<ArrayBuffer>): Promise<T> {
  const restore = async(item: unknown): Promise<unknown> => {
    if (Array.isArray(item)) {
      return await Promise.all(item.map(restore))
    }

    if (!item || typeof item !== "object") {
      return item
    }

    if (HISTORY_BLOB_KEY in item) {
      const placeholder = item as HistoryBlobPlaceholder
      const buffer = await loadBlob(placeholder[HISTORY_BLOB_KEY])
      const { kind, name = "", type = "", lastModified } = placeholder

      if (kind === "File") return new File([buffer], name, { type, lastModified })
      if (kind === "Blob") return new Blob([buffer], { type })
      if (kind === "ArrayBuffer") return buffer

      // Typed arrays and DataView, by their constructor's name
      const View = (globalThis as Record<string, unknown>)[kind]
      return typeof View === "function"
        ? new (View as new (buffer: ArrayBuffer) => ArrayBufferView)(buffer)
        : new Uint8Array(buffer)
    }

    const entries = await Promise.all(Object.entries(item).map(async([key, child]) => [key, await restore(child)]))
    return Object.fromEntries(entries)
  }

  return await restore(value) as T
}
