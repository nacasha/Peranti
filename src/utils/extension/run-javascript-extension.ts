/**
 * Runs JavaScript extension `code` in a fresh Web Worker and resolves with
 * the output values its default export returns. The worker is terminated
 * once it answers or `timeoutMs` passes, so a stuck extension can't freeze
 * the app.
 */
export async function runJavaScriptExtension(
  code: string,
  inputValues: Record<string, any>,
  timeoutMs: number = 30_000
): Promise<Record<string, any>> {
  const worker = new Worker(new URL("../../workers/extension-worker.ts", import.meta.url), { type: "module" })

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      worker.terminate()
      reject(new Error(`Timed out after ${timeoutMs / 1000}s`))
    }, timeoutMs)

    const finish = () => {
      clearTimeout(timeout)
      worker.terminate()
    }

    worker.onmessage = (event: MessageEvent<{ result?: Record<string, any>, error?: string }>) => {
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

    worker.postMessage({ code, inputValues })
  })
}
