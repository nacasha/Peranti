/**
 * Runs one JavaScript extension: the code is imported as a module and its
 * default export is called with the input values. The worker is terminated
 * after each run, so nothing is kept between runs.
 */
self.onmessage = async(event: MessageEvent<{ code: string, inputValues: Record<string, any> }>) => {
  const { code, inputValues } = event.data
  const moduleUrl = URL.createObjectURL(new Blob([code], { type: "text/javascript" }))

  try {
    const module = await import(/* @vite-ignore */ moduleUrl)

    if (typeof module.default !== "function") {
      throw new Error("Extension entry must export a default function")
    }

    const result = await module.default(inputValues)
    self.postMessage({ result: result ?? {} })
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) })
  } finally {
    URL.revokeObjectURL(moduleUrl)
  }
}
