import { invoke } from "@tauri-apps/api/tauri"

export const RustInvoke = {
  revealFileManager: async(path: string) => {
    await invoke("reveal_file_manager", { path })
  }
}
