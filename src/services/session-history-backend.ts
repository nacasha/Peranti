import { invoke } from "@tauri-apps/api/core"

import { type HistoryPreviewField } from "src/types/AppletHistory"
import { type AppletState } from "src/types/AppletState"
import { type HistoryBlob, type SessionHistorySnapshot, type SessionHistoryPage } from "src/types/SessionHistory"

export interface SessionHistoryListOptions {
  query?: string
  offset: number
  limit: number
}

/**
 * Closed tab history, kept in a SQLite file by the Rust side of the desktop
 * app (src-tauri/src/history.rs), which also does the searching. Not
 * available in the web build.
 */
export const sessionHistoryBackend = {
  /**
   * Sent as one raw payload so the entry and its binary values are saved
   * together: a little-endian u32 head length, the JSON head, then the blobs'
   * bytes back to back
   */
  add: async(entry: SessionHistorySnapshot, blobs: HistoryBlob[], maxEntries: number) => {
    const head = new TextEncoder().encode(JSON.stringify({
      entry,
      maxEntries,
      blobs: blobs.map(({ id, bytes }) => ({ id, length: bytes.byteLength }))
    }))

    const body = new Uint8Array(4 + head.byteLength + blobs.reduce((total, { bytes }) => total + bytes.byteLength, 0))
    new DataView(body.buffer).setUint32(0, head.byteLength, true)
    body.set(head, 4)

    let offset = 4 + head.byteLength
    for (const { bytes } of blobs) {
      body.set(bytes, offset)
      offset += bytes.byteLength
    }

    await invoke("history_add", body)
  },

  list: async({ query, offset, limit }: SessionHistoryListOptions) => (
    await invoke<SessionHistoryPage>("history_list", { query, offset, limit })
  ),

  /**
   * Stored state, with placeholders where its binary values go
   */
  get: async(sessionId: string) => (
    await invoke<AppletState | null>("history_get", { sessionId }) ?? undefined
  ),

  /**
   * Bytes of one binary value, sent raw
   */
  getBlob: async(sessionId: string, blobId: string) => (
    await invoke<ArrayBuffer>("history_get_blob", { sessionId, blobId })
  ),

  /**
   * Single input / output values of an entry, in order, without sending over
   * its whole state
   */
  fields: async(
    sessionId: string,
    fields: Array<Pick<HistoryPreviewField, "source" | "key"> & { maxLength?: number }>
  ) => (
    await invoke<unknown[]>("history_fields", {
      sessionId,
      fields: fields.map(({ source, key, maxLength }) => ({ source, key, maxLength }))
    })
  ),

  remove: async(sessionId: string) => {
    await invoke("history_remove", { sessionId })
  },

  trim: async(maxEntries: number) => { await invoke("history_trim", { maxEntries }) },

  clear: async() => { await invoke("history_clear") }
}
