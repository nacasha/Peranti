import { appWindow } from "@tauri-apps/api/window"

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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
}
