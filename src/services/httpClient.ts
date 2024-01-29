import axios from "axios"
import axiosTauriApiAdapter from "axios-tauri-api-adapter"

export const httpClient = axios.create({ adapter: axiosTauriApiAdapter })
