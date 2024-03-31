import { writeText } from "@tauri-apps/plugin-clipboard-manager"

export class ClipboardService {
  static async copyAsText(text: string) {
    await writeText(`${text}`)
  }
}
