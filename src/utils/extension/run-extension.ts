import { ExtensionRuntime } from "src/enums/extension-runtime"
import { rustInvokerService } from "src/services/rust-invoker-service"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type ExtensionWorkerRequest, type ExtensionWorkerResponse } from "src/types/ExtensionWorkerMessage"

/**
 * Longest part of an executable's output quoted when it isn't JSON
 */
const MAX_QUOTED_OUTPUT_LENGTH = 200

/**
 * Longest a JavaScript tool may run, so a stuck one can't freeze the app
 */
const JAVASCRIPT_TIMEOUT_MS = 30_000

const MILLISECONDS_PER_SECOND = 1000

/**
 * Runs JavaScript extension `code` in a fresh Web Worker and resolves with
 * the output values its default export returns. The worker is terminated
 * once it answers or `timeoutMs` passes, so a stuck extension can't freeze
 * the app.
 */
async function runJavaScriptExtension(
  code: string,
  inputValues: Record<string, any>,
  timeoutMs: number = JAVASCRIPT_TIMEOUT_MS
): Promise<Record<string, any>> {
  const worker = new Worker(new URL("../../workers/extension-worker.ts", import.meta.url), { type: "module" })

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.terminate()
      reject(new Error(`Timed out after ${timeoutMs / MILLISECONDS_PER_SECOND}s`))
    }, timeoutMs)

    const finish = () => {
      clearTimeout(timeout)
      worker.terminate()
    }

    worker.onmessage = (event: MessageEvent<ExtensionWorkerResponse>) => {
      finish()

      if (event.data.error !== undefined) {
        reject(new Error(event.data.error))
      } else {
        resolve(event.data.result ?? {})
      }
    }

    worker.onerror = (event) => {
      finish()
      reject(new Error(event.message || "Extension worker failed"))
    }

    const request: ExtensionWorkerRequest = { code, inputValues }
    worker.postMessage(request)
  })
}

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
