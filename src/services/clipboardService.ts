import { writeText } from "tauri-plugin-clipboard-api"

export class ClipboardService {
  static async copyText(text: string) {
    await writeText(`${text}`)
  }
}
