import { makeAutoObservable } from "mobx"

export type ExtensionsPageTab = "installed" | "browse"

class ExtensionsPageStore {
  /**
   * Tab to show the next time the extensions page is opened from elsewhere.
   * Consumed by the page, so opening it any other way starts at Installed.
   */
  pendingTab?: ExtensionsPageTab

  constructor() {
    makeAutoObservable(this)
  }

  openTab(tab: ExtensionsPageTab) {
    this.pendingTab = tab
  }

  consumePendingTab(): ExtensionsPageTab | undefined {
    const tab = this.pendingTab
    this.pendingTab = undefined
    return tab
  }
}

export const extensionsPageStore = new ExtensionsPageStore()
