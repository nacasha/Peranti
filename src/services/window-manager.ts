import { type EventCallback } from "@tauri-apps/api/event"
import { type DragDropEvent } from "@tauri-apps/api/webview"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"

import { isRunningInTauri } from "src/utils/is-running-in-tauri"

export const windowManager = {
  /**
   * Minimize application window
   */
  async minimize() {
    await getCurrentWebviewWindow().minimize()
  },

  /**
   * Toggle maximize application window
   */
  async toggleMaximize() {
    await getCurrentWebviewWindow().toggleMaximize()
  },

  /**
   * Close application window
   */
  async close() {
    await getCurrentWebviewWindow().close()
  },

  /**
   * Set focus on application window
   */
  async setFocus() {
    await getCurrentWebviewWindow().setFocus()
  },

  /**
   * Start drag / move the application window
   */
  async startDragging() {
    await getCurrentWebviewWindow().startDragging()
  },

  /**
   * Event handler when file dropped on application window
   *
   * @param handler
   * @returns
   */
  async onFileDropEvent(handler: EventCallback<DragDropEvent>) {
    if (isRunningInTauri) {
      return await getCurrentWebviewWindow().onDragDropEvent(handler)
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
      return await getCurrentWebviewWindow().isMaximized()
    }
    return true
  }
}
