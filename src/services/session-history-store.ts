import NiceModal from "@ebay/nice-modal-react"
import localforage from "localforage"
import { makeAutoObservable, runInAction } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { ConfirmDialog } from "src/components/dialog/ConfirmDialog/ConfirmDialog.tsx"
import { StorageKeys } from "src/constants/storage-keys.ts"
import { type Applet } from "src/models/Applet.ts"
import { StorageManager } from "src/services/storage-manager.ts"
import { type HistoryPreviewField } from "src/types/AppletHistory.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"
import { isRunningInTauri } from "src/utils/is-running-in-tauri.ts"
import { restoreBinaryValues } from "src/utils/restore-binary-values.ts"

import { sessionHistoryBackend, type SessionHistoryListOptions } from "./session-history-backend.ts"
import { sessionStore } from "./session-store.ts"

/**
 * Entries kept in memory for the titlebar popover
 */
const RECENT_LIMIT = 20

/**
 * Characters of a text field read for the list preview, a little over the
 * line it's shown in, so whitespace collapsing still fills it
 */
const TEXT_FIELD_LENGTH = 400

class SessionHistoryStore {
  /**
   * History lives on the Rust side, so the web build has none
   */
  readonly isSupported = isRunningInTauri

  /**
   * Newest entries, for the popover. The full list is paged from the backend.
   */
  recent: SessionHistory[] = []

  /**
   * Bumped on every change, so views holding a page of entries reload
   */
  revision = 0

  numberOfMaximumHistory = 500

  featureEnabled = true

  constructor() {
    makeAutoObservable(this)

    void this.setupPersistence()
    void this.refreshRecent()
  }

  async setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.SessionHistoryStore,
      storage: localforage,
      stringify: false,
      properties: ["numberOfMaximumHistory", "featureEnabled"]
    })
  }

  setFeatureEnabled(value: boolean) {
    this.featureEnabled = value
  }

  async refreshRecent() {
    if (!this.isSupported) return

    const { items } = await sessionHistoryBackend.list({ offset: 0, limit: RECENT_LIMIT })

    runInAction(() => {
      this.recent = items
      this.revision++
    })
  }

  async list(options: SessionHistoryListOptions) {
    return await sessionHistoryBackend.list(options)
  }

  /**
   * Values of the given fields of a closed tab, in order. Binary values come
   * as their placeholders, which keep e.g. a file's name.
   */
  async getFieldValues(history: SessionHistory, fields: HistoryPreviewField[]): Promise<unknown[]> {
    if (fields.length === 0) {
      return []
    }

    // Fields without a history component are shown as one line of text, so
    // only their start is sent over. Components get the whole value.
    return await sessionHistoryBackend.fields(history.sessionId, fields.map((field) => ({
      ...field,
      maxLength: field.Component ? undefined : TEXT_FIELD_LENGTH
    })))
  }

  /**
   * Keeps a closed tab, files and buffers included, on the Rust side. Only
   * tabs that were run and still hold values are worth keeping. Returns
   * whether it was kept; either way its IndexedDB state is no longer needed.
   */
  async addHistory(applet: Applet): Promise<boolean> {
    const isValuesModified = applet.isInputValuesModified || applet.isOutputValuesModified
    const isWorthKeeping = applet.actionRunCount > 0 && isValuesModified && applet.getIsInputOrOutputHasValues()

    if (!this.isSupported || !this.featureEnabled || !isWorthKeeping) {
      return false
    }

    /**
     * Marked as deleted first, as closed tabs always were: that drops the
     * field states, which for code editors hold a second copy of the text
     */
    await applet.markAsDeleted()

    try {
      const { history, blobs } = await applet.toHistory()
      await sessionHistoryBackend.add(history, blobs, this.numberOfMaximumHistory)

      void this.refreshRecent()
      return true
    } catch (error) {
      console.error("Failed to add closed tab to history", error)
      return false
    }
  }

  /**
   * Lowering the limit drops the oldest entries right away
   */
  async setNumberOfMaximumHistory(value: number) {
    this.numberOfMaximumHistory = Math.max(0, Math.floor(value))

    await sessionHistoryBackend.trim(this.numberOfMaximumHistory)
    void this.refreshRecent()
  }

  /**
   * Reopens the entry as a regular tab: its state, files and buffers rebuilt,
   * is written to IndexedDB, where the session store loads tabs from, and the
   * entry leaves history
   */
  async restoreHistory(history: SessionHistory) {
    const stored = await sessionHistoryBackend.get(history.sessionId)

    if (stored) {
      const state = await restoreBinaryValues(stored, async(blobId) => (
        await sessionHistoryBackend.getBlob(history.sessionId, blobId)
      ))

      await StorageManager.putAppletStateIntoStorage(history.sessionId, state)
      await sessionHistoryBackend.remove(history.sessionId)
      await sessionStore.openHistory(history)
    }

    void this.refreshRecent()
  }

  async deleteHistory(history: SessionHistory) {
    await sessionHistoryBackend.remove(history.sessionId)
    void this.refreshRecent()
  }

  async restoreLastHistory() {
    if (!this.isSupported) return

    const { items } = await sessionHistoryBackend.list({ offset: 0, limit: 1 })

    if (items[0]) {
      await this.restoreHistory(items[0])
    }
  }

  async clearAllHistory() {
    await sessionHistoryBackend.clear()
    void this.refreshRecent()
  }

  clearAllHistoryWithConfirm() {
    void NiceModal.show(ConfirmDialog, {
      title: "Clear History",
      description: "All closed tabs in history will be removed",
      onConfirm: () => {
        void this.clearAllHistory()
      }
    })
  }

  /**
   * Turning history off also clears it, so no closed tab state is left
   * behind in storage while nothing can show it
   */
  disableHistoryWithConfirm() {
    void NiceModal.show(ConfirmDialog, {
      title: "Disable History",
      description: "Closed tabs will no longer be kept, and the current history will be cleared",
      onConfirm: () => {
        void this.clearAllHistory()
        this.setFeatureEnabled(false)
      }
    })
  }
}

export const sessionHistoryStore = new SessionHistoryStore()
