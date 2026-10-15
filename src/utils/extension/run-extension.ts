import { ExtensionRuntime } from "src/enums/extension-runtime"
import { rustInvokerService } from "src/services/rust-invoker-service"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"

import { runJavaScriptExtension } from "./run-javascript-extension.js"

/**
 * Longest part of an executable's output quoted when it isn't JSON
 */
const MAX_QUOTED_OUTPUT_LENGTH = 200

/**
 * Runs an extension with the runtime it declares and resolves with its
 * output values
 */
export async function runExtension(metadata: ExtensionMetadata, inputValues: Record<string, any>): Promise<Record<string, any>> {
  if (metadata.runtime === ExtensionRuntime.JavaScript && metadata.entryFile) {
    return await runJavaScriptExtension(await metadata.folder.readText(metadata.entryFile), inputValues)
  }

  if (metadata.runtime === ExtensionRuntime.Executable && metadata.executable && metadata.workingDirectory) {
    const { command, args = [], timeoutMs } = metadata.executable

    const stdout = await rustInvokerService.runExtensionProcess({
      cwd: metadata.workingDirectory,
      command,
      args,
      input: JSON.stringify(inputValues),
      timeoutMs
    })

    try {
      return JSON.parse(stdout)
    } catch {
      throw new Error(`Output is not valid JSON: ${stdout.trim().slice(0, MAX_QUOTED_OUTPUT_LENGTH) || "(empty)"}`)
    }
  }

  throw new Error(`Unsupported runtime "${metadata.runtime}"`)
}
