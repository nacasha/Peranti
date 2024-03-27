import { open } from "@tauri-apps/plugin-shell"

import { isRunningInTauri } from "./is-running-in-tauri.js"

export async function openLink(link: string) {
  if (isRunningInTauri) {
    await open(link)
  } else {
    window.open(link, "_blank")
  }
}
