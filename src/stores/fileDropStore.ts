import { makeAutoObservable } from "mobx"

import { generateRandomString } from "src/utils/generateRandomString"

class FileDropStore {
  #isHovering: boolean = false

  readonly #dropListeners: Record<string, ((files: any) => void) | undefined> = {}

  constructor() {
    makeAutoObservable(this)
  }

  get isDroppingFile() {
    return this.#isHovering
  }

  setIsDroppingFile(value: boolean) {
    this.#isHovering = value
  }

  addDropListener(callback: (files: any) => void) {
    const listenerNumber = new Date().getTime().toString().concat(
      generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm")
    )

    this.#dropListeners[listenerNumber] = callback

    return () => {
      this.#dropListeners[listenerNumber] = undefined
    }
  }

  getListeners() {
    return Object.values(this.#dropListeners).filter((listener) => !!listener)
  }

  callListeners(files: string[]) {
    const listeners = this.getListeners()
    if (listeners.length > 0) {
      listeners.forEach((listenerCallback) => {
        if (listenerCallback) {
          listenerCallback(files)
        }
      })
    }
  }
}

export const fileDropStore = new FileDropStore()
