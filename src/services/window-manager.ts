import { appWindow } from "@tauri-apps/api/window"

export class windowManager {
  static async minimize() {
    await appWindow.minimize()
  }

  static async toggleMaximize() {
    await appWindow.toggleMaximize()
  }

  static async close() {
    await appWindow.close()
  }

  static async setFocus() {
    await appWindow.setFocus()
  }
}
