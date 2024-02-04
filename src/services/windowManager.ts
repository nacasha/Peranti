import { appWindow } from "@tauri-apps/api/window"

export class windowManager {
  /**
   * Minimize app window
   */
  static async minimize() {
    await appWindow.minimize()
  }

  /**
   * Toggle maximize app window
   */
  static async toggleMaximize() {
    await appWindow.toggleMaximize()
  }

  /**
   * Close window
   */
  static async close() {
    await appWindow.close()
  }

  static async setFocus() {
    await appWindow.setFocus()
  }
}
