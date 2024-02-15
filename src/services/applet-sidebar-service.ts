import { makeAutoObservable } from "mobx"

class AppletSidebarService {
  isOpen: boolean = true

  constructor() {
    makeAutoObservable(this)
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
