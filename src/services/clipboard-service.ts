import { writeText } from "@tauri-apps/plugin-clipboard-manager"

export class ClipboardService {
  static async copyText(text: string) {
    await writeText(`${text}`)
  }
}
