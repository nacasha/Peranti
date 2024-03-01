import { type EventCallback } from "@tauri-apps/api/event"
import { getCurrent, type FileDropEvent } from "@tauri-apps/api/webviewWindow"

export const windowManager = {
  async minimize() {
    await getCurrent().minimize()
  },

  async toggleMaximize() {
    await getCurrent().toggleMaximize()
  },

  async close() {
    await getCurrent().close()
  },

  async setFocus() {
    await getCurrent().setFocus()
  },

  async startDragging() {
    await getCurrent().startDragging()
  },

  async onFileDropEvent(handler: EventCallback<FileDropEvent>) {
    return await getCurrent().onFileDropEvent(handler)
  },

  async isMaximized() {
    return await getCurrent().isMaximized()
  }
}
