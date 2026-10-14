import { invoke } from "@tauri-apps/api/core"

interface RunExtensionProcessOptions {
  cwd: string
  command: string
  args: string[]
  input: string
  timeoutMs?: number
}

export const rustInvokerService = {
  async revealFileManager(path: string) {
    await invoke("reveal_file_manager", { path })
  },

  /**
   * Run an executable extension, resolves with its stdout and rejects with
   * its stderr when it exits with an error
   */
  async runExtensionProcess(options: RunExtensionProcessOptions) {
    return await invoke<string>("run_extension_process", { ...options })
  }
}
