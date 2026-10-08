import { makeAutoObservable } from "mobx"

export type SettingsSectionId = "appearance" | "fonts" | "tabbar" | "toolSidebar" | "fileDrop" | "history" | "appData"

class SettingsPageStore {
  /**
   * Category to show the next time the settings page is opened from another
   * page. Consumed by the settings page, so opening settings any other way
   * still starts at Appearance.
   */
  pendingSectionId?: SettingsSectionId

  constructor() {
    makeAutoObservable(this)
  }

  openSection(sectionId: SettingsSectionId) {
    this.pendingSectionId = sectionId
  }

  consumePendingSection(): SettingsSectionId | undefined {
    const sectionId = this.pendingSectionId
    this.pendingSectionId = undefined
    return sectionId
  }
}

export const settingsPageStore = new SettingsPageStore()
