import { makeAutoObservable } from "mobx"

class AppletSidebarService {
  isOpen: boolean = false

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
