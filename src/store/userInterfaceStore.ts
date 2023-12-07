import { makeAutoObservable } from "mobx"

class UserInterfaceStore {
  isSidebarHidden = false

  constructor() {
    makeAutoObservable(this)
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden
  }
}

export const userInterfaceStore = new UserInterfaceStore()
