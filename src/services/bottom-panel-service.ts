import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"

class BottomPanelService {
  isOpen: boolean = false

  constructor() {
    makeAutoObservable(this)
    void makePersistable(this, {
      name: StorageKeys.BottomPanel,
      properties: ["isOpen"]
    })
  }

  toggleIsOpen() {
    this.isOpen = !this.isOpen
  }

  open() {
    this.isOpen = true
  }

  hide() {
    this.isOpen = false
  }
}

export const bottomPanelService = new BottomPanelService()
