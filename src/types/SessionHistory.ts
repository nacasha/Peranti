import { type AppletState } from "./AppletState.ts"

/**
 * Which closed tab an entry is, shared by what's saved and what's listed
 */
export interface SessionHistoryBase {
  appletId: string
  sessionId: string
  sessionName?: string
  deletedAt: number
}

/**
 * A closed tab as listed: computed by the Rust side on every read, without
 * the tab's state or values
 */
export interface SessionHistory extends SessionHistoryBase {
  /**
   * Start of the tab's inputs (then outputs) on one line, cut when listed
   */
  preview?: string

  /**
   * Search results only: excerpt around the first match in a value
   */
  searchResultPreview?: string

  /**
   * Search results only: the input or output value that preview comes from
   */
  searchResultField?: { source: "input" | "output", key: string }

  /**
   * Bytes the entry takes in storage: state, values and binary values
   */
  size?: number
}

/**
 * Key of the placeholder that stands in for a binary value (file, buffer) in
 * a stored tab state, naming the blob holding its bytes
 */
export const HISTORY_BLOB_KEY = "$historyBlob"

export interface HistoryBlobPlaceholder {
  [HISTORY_BLOB_KEY]: string

  /**
   * What to rebuild: "File", "Blob", "ArrayBuffer", or a typed array's name
   */
  kind: string
  name?: string
  type?: string
  lastModified?: number
}

/**
 * A binary value's bytes, sent alongside the entry it belongs to
 */
export interface HistoryBlob {
  id: string
  bytes: Uint8Array
}

/**
 * One input or output value of a closed tab, stored as text: strings as they
 * are, anything else as JSON. Searching and previews read these.
 */
export interface SessionHistoryValue {
  source: "input" | "output"
  key: string
  kind: "text" | "json"
  text: string
}

/**
 * A closed tab as saved: everything needed to restore it, captured when it
 * was closed (`Applet.toHistory`)
 */
export interface SessionHistorySnapshot extends SessionHistoryBase {
  /**
   * Searched along with the values
   */
  toolName: string

  /**
   * Applet state without its input and output values, which go in `values`
   */
  state: Omit<AppletState, "inputValues" | "outputValues">

  /**
   * Input then output values, in field order, binary values swapped for
   * placeholders
   */
  values: SessionHistoryValue[]
}

export interface SessionHistoryPage {
  items: SessionHistory[]
  total: number
}
