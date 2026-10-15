/**
 * Sent to the worker that runs a JavaScript extension, see `extension-worker`
 */
export interface ExtensionWorkerRequest {
  code: string
  inputValues: Record<string, unknown>
}

/**
 * The worker's answer: the output values, or why the run failed
 */
export type ExtensionWorkerResponse =
  | { result: Record<string, unknown>, error?: undefined }
  | { result?: undefined, error: string }
