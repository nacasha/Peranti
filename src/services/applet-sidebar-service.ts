import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"

class AppletSidebarService {
  isOpen: boolean = true

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: StorageKeys.AppletSidebar,
      properties: ["isOpen"]
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
}

export const appletSidebarService = new AppletSidebarService()
