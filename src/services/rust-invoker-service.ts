import { Command } from "@tauri-apps/api/shell"
import { invoke } from "@tauri-apps/api/tauri"

interface RunExtensionOptions {
  external: string[]
  builtin: string[]
  file: string
  input: string
}

export const rustInvokerService = {
  async revealFileManager(path: string) {
    await invoke("reveal_file_manager", { path })
  },

  async runExtension(options: RunExtensionOptions) {
    const command = new Command(
      "run-extension",
      ["scripts/extension-runner.cjs", JSON.stringify(options)]
    )

    command.stdout.addListener("data", (e) => {
      console.log(e)
    })

    command.stderr.addListener("data", (e) => {
      console.log(e)
    })

    const result = await command.execute()
    return JSON.parse(result.stdout)
  }
}
