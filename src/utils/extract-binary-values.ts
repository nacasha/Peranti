import { HISTORY_BLOB_KEY, type HistoryBlob, type HistoryBlobPlaceholder } from "src/types/SessionHistory"

/**
 * Copy of `value` with every file and buffer swapped for a placeholder, and
 * the bytes of each, so the value can be stored as JSON with the bytes beside
 * it. `restoreBinaryValues` puts them back.
 */
export async function extractBinaryValues<T>(value: T): Promise<{ value: T, blobs: HistoryBlob[] }> {
  const blobs: HistoryBlob[] = []

  // Values are read in parallel, so ids come from a counter taken before any
  // await, never from the list's length
  let lastBlobNumber = 0

  const extract = async(item: unknown): Promise<unknown> => {
    if (item instanceof Blob || item instanceof ArrayBuffer || ArrayBuffer.isView(item)) {
      const id = `b${++lastBlobNumber}`
      const placeholder: HistoryBlobPlaceholder = { [HISTORY_BLOB_KEY]: id, kind: item.constructor.name }

      if (item instanceof Blob) {
        blobs.push({ id, bytes: new Uint8Array(await item.arrayBuffer()) })
        placeholder.type = item.type
      } else if (item instanceof ArrayBuffer) {
        blobs.push({ id, bytes: new Uint8Array(item.slice(0)) })
      } else {
        blobs.push({ id, bytes: new Uint8Array(item.buffer.slice(item.byteOffset, item.byteOffset + item.byteLength)) })
      }

      if (item instanceof File) {
        placeholder.name = item.name
        placeholder.lastModified = item.lastModified
      }

      return placeholder
    }

    if (Array.isArray(item)) {
      return await Promise.all(item.map(extract))
    }

    if (item && typeof item === "object") {
      const entries = await Promise.all(Object.entries(item).map(async([key, child]) => [key, await extract(child)]))
      return Object.fromEntries(entries)
    }

    return item
  }

  return { value: await extract(value) as T, blobs }
}
