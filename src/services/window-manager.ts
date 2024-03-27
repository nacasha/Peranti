import { type EventCallback } from "@tauri-apps/api/event"
import { getCurrent, type FileDropEvent } from "@tauri-apps/api/webviewWindow"

import { isRunningInTauri } from "src/utils/is-running-in-tauri"

export const windowManager = {
  /**
   * Minimize application window
   */
  async minimize() {
    await getCurrent().minimize()
  },

  /**
   * Toggle maximize application window
   */
  async toggleMaximize() {
    await getCurrent().toggleMaximize()
  },

  /**
   * Close application window
   */
  async close() {
    await getCurrent().close()
  },

  /**
   * Set focus on application window
   */
  async setFocus() {
    await getCurrent().setFocus()
  },

  /**
   * Start drag / move the application window
   */
  async startDragging() {
    await getCurrent().startDragging()
  },

  /**
   * Event handler when file dropped on application window
   *
   * @param handler
   * @returns
   */
  async onFileDropEvent(handler: EventCallback<FileDropEvent>) {
    if (isRunningInTauri) {
      return await getCurrent().onFileDropEvent(handler)
    }

    return () => {}
  },

  /**
   * Get state whether the application maximized or not
   *
   * @returns
   */
  async isMaximized() {
    if (isRunningInTauri) {
      return await getCurrent().isMaximized()
    }
    return true
  }
}
