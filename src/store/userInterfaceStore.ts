import { makeAutoObservable } from "mobx"

class UserInterfaceStore {
  isSidebarHidden = true

  sidebarMode: "dock-pinned" | "dock-unpinned" | "unpinned" = "unpinned"

  textAreaWordWrap = false

  constructor() {
    makeAutoObservable(this)
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden
  }
}

export const userInterfaceStore = new UserInterfaceStore()
