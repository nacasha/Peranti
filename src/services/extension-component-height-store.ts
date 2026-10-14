import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"

/**
 * Most heights kept, the oldest are dropped past it
 */
const MAX_ENTRIES = 200

/**
 * Last content height of each extension component field, so a frame opens
 * at its size instead of starting empty and jumping once its page loads
 */
class ExtensionComponentHeightStore {
  heights: Record<string, number> = {}

  constructor() {
    makeAutoObservable(this)
    void makePersistable(this, {
      name: StorageKeys.ExtensionComponentHeights,
      properties: ["heights"]
    })
  }

  get(key: string): number | undefined {
    return this.heights[key]
  }

  set(key: string, height: number) {
    if (this.heights[key] === height) {
      return
    }

    // Re-added last, so the oldest stay first to be dropped
    const { [key]: _previous, ...rest } = this.heights
    const entries = Object.entries(rest)
    this.heights = Object.fromEntries([...entries.slice(Math.max(entries.length - MAX_ENTRIES + 1, 0)), [key, height]])
  }
}

export const extensionComponentHeightStore = new ExtensionComponentHeightStore()
