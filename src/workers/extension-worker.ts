import { type ExtensionWorkerRequest, type ExtensionWorkerResponse } from "src/types/ExtensionWorkerMessage"
import { getErrorMessage } from "src/utils/common/get-error-message"

const respond = (response: ExtensionWorkerResponse) => {
  self.postMessage(response)
}

/**
 * Runs one JavaScript extension: the code is imported as a module and its
 * default export is called with the input values. The worker is terminated
 * after each run, so nothing is kept between runs.
 */
self.onmessage = async(event: MessageEvent<ExtensionWorkerRequest>) => {
  const { code, inputValues } = event.data
  const moduleUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }))

  try {
    const module = await import(/* @vite-ignore */ moduleUrl)

    if (typeof module.default !== "function") {
      throw new Error("Extension entry must export a default function")
    }

    const result = await module.default(inputValues)
    respond({ result: result ?? {} })
  } catch (error) {
    respond({ error: getErrorMessage(error) })
  } finally {
    URL.revokeObjectURL(moduleUrl)
  }
}
