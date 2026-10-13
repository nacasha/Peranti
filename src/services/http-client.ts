import { fetch as fetchTauri } from "@tauri-apps/plugin-http"

import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

interface Options {
  method: "GET"
  headers?: Record<string, string>
}

interface HttpResponse {
  status: number
  ok: boolean
  body: ArrayBuffer
}

/**
 * Send a request through Tauri on desktop (no CORS) and the browser's fetch
 * otherwise. Throws on network errors, an error status is returned as is.
 */
export const httpRequest = async(path: string, options: Options): Promise<HttpResponse> => {
  const fetchFn = isRunningInTauri ? fetchTauri : fetch

  // A browser sends its own user agent, and a custom one makes hosts that
  // don't allow it in CORS refuse the request
  let headers = options.headers
  if (!isRunningInTauri && headers) {
    const { "User-Agent": _userAgent, ...rest } = headers
    headers = rest
  }

  const response = await fetchFn(path, {
    method: options.method,
    headers
  })

  return {
    status: response.status,
    ok: response.ok,
    body: await response.arrayBuffer()
  }
}

export const httpClient = async(path: string, options: Options): Promise<ArrayBuffer | undefined> => {
  try {
    const response = await httpRequest(path, options)
    return response.body
  } catch (error) {
    console.log(error)
    return undefined
  }
}
