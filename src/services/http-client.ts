import axios from "axios"
import axiosTauriApiAdapter from "axios-tauri-api-adapter"

import { isRunningInTauri } from "src/utils/is-running-in-tauri"

export const httpClient = isRunningInTauri
  ? axios.create({ adapter: axiosTauriApiAdapter })
  : axios.create()
