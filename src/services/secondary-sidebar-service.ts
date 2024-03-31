import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"

class SecondarySidebarService {
  isOpen: boolean = true

  expandedSection: Record<string, boolean> = {}

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: StorageKeys.SecondarySidebar,
      properties: ["isOpen", "expandedSection"]
    })
  }

  toggle() {
    this.isOpen = !this.isOpen
  }

  show() {
    this.isOpen = true
  }

  hide() {
    this.isOpen = false
  }

  setExpandedSection(sectionKey: string, value: boolean) {
    this.expandedSection[sectionKey] = value
  }

  toggleExpandedSection(sectionKey: string) {
    this.expandedSection[sectionKey] = !this.expandedSection[sectionKey]
  }
}

export const secondarySidebarService = new SecondarySidebarService()
