import { makeAutoObservable } from "mobx"

export type WorkbenchPageTab = "tools" | "components"

class WorkbenchPageStore {
  /**
   * Tab to show the next time the workbench is opened from elsewhere.
   * Consumed by the page, so opening it any other way keeps its tab.
   */
  pendingTab?: WorkbenchPageTab

  /**
   * Component the Components tab should pick when it next shows, by its key
   */
  pendingComponentKey?: string

  constructor() {
    makeAutoObservable(this)
  }

  openTab(tab: WorkbenchPageTab) {
    this.pendingTab = tab
  }

  /**
   * Show a component in the playground of the Components tab
   */
  openComponent(componentKey: string) {
    this.pendingComponentKey = componentKey
    this.pendingTab = "components"
  }

  consumePendingTab(): WorkbenchPageTab | undefined {
    const tab = this.pendingTab
    this.pendingTab = undefined
    return tab
  }

  consumePendingComponentKey(): string | undefined {
    const key = this.pendingComponentKey
    this.pendingComponentKey = undefined
    return key
  }
}

export const workbenchPageStore = new WorkbenchPageStore()
