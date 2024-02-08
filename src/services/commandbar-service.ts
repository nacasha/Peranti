import { makeAutoObservable } from "mobx"

import { appletStore } from "./applet-store.js"

class CommandbarService {
  isOpen: boolean = false

  items: Array<{ key: string, label: string, shortcut?: string[] }> = []

  constructor() {
    makeAutoObservable(this)
  }

  toggleOpen() {
    this.isOpen = !this.isOpen
  }

  setIsOpen(isOpen: boolean) {
    this.isOpen = isOpen
  }

  open() {
    this.isOpen = true
  }

  close() {
    this.isOpen = false
  }

  setItems(items: any) {
    this.items = items
  }

  addItem(item: any) {
    this.items.push(item)
  }

  setupItems() {
    const items = appletStore.listOfLoadedApplets.map((appletConstructor) => {
      return {
        key: appletConstructor.appletId,
        label: appletConstructor.name
      }
    })

    this.items = items
  }
}

export const commandbarService = new CommandbarService()
