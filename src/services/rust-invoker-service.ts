import { invoke } from "@tauri-apps/api/tauri"

export const RustInvokerService = {
  revealFileManager: async(path: string) => {
    await invoke("reveal_file_manager", { path })
  }
}
