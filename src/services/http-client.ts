import { fetch as fetchTauri } from "@tauri-apps/plugin-http"

import { isRunningInTauri } from "src/utils/is-running-in-tauri"

interface Options {
  method: "GET"
}

export const httpClient = async(path: string, options: Options): Promise<ArrayBuffer | undefined> => {
  try {
    if (isRunningInTauri) {
      const response = await fetchTauri(path, {
        method: options.method
      })

      return await response.arrayBuffer()
    }

    const response = await fetch(path, {
      method: options.method
    })

    return await response.arrayBuffer()
  } catch (error) {
    console.log(error)
    return undefined
  }
}
