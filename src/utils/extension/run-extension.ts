import { ExtensionRuntime } from "src/enums/extension-runtime"
import { fileService } from "src/services/file-service"
import { rustInvokerService } from "src/services/rust-invoker-service"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"

import { runJavaScriptExtension } from "./run-javascript-extension.js"

/**
 * Runs an extension with the runtime it declares and resolves with its
 * output values
 */
export async function runExtension(metadata: ExtensionMetadata, inputValues: Record<string, any>): Promise<Record<string, any>> {
  if (metadata.runtime === ExtensionRuntime.JavaScript && metadata.entryFile) {
    const code = await fileService.readFileAsText(metadata.entryFile)
    return await runJavaScriptExtension(code, inputValues)
  }

  if (metadata.runtime === ExtensionRuntime.Executable && metadata.executable) {
    const { command, args = [], timeoutMs } = metadata.executable

    const stdout = await rustInvokerService.runExtensionProcess({
      cwd: metadata.folderPath,
      command,
      args,
      input: JSON.stringify(inputValues),
      timeoutMs
    })

    try {
      return JSON.parse(stdout)
    } catch {
      throw new Error(`Output is not valid JSON: ${stdout.trim().slice(0, 200) || "(empty)"}`)
    }
  }

  throw new Error(`Unsupported runtime "${metadata.runtime}"`)
}
