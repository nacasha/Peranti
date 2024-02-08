import { makeAutoObservable } from "mobx"

import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"

import { appletStore } from "./applet-store.js"

/**
 * Service to manage applets with type `Tool` to be showed on tool sidebar
 */
class ToolSidebarService {
  /**
   * Should group applets by its category
   */
  groupByCategory: boolean = true

  /**
   * Auto sort all applets by its name
   */
  private readonly sortNameAZ: boolean = true

  /**
   * When `groupByCategory` is enabled, this value will be used to
   * sort the category name
   */
  private readonly sortCategoryAZ: boolean = true

  /**
   * Map key value of applet category and list of applet constructor
   */
  items: Record<string, AppletConstructor[]> = {}

  /**
   * Tool sidebar service constructor
   */
  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Setup items for tool sidebar
   */
  setupItems() {
    /**
     * Set initial group `General`
     */
    let listOfCategoriesAndApplets: Record<string, AppletConstructor[]> = {
      General: []
    }

    /**
     * Group applets by its category when enabled.
     * If not, all applets will be placed into `General` category
     */
    if (this.groupByCategory) {
      listOfCategoriesAndApplets = Object.fromEntries(appletStore.listOfLoadedApplets.map(
        (applet) => [applet.category, [] as AppletConstructor[]]
      ))
    }

    /**
     * Only filter applets with type equal to `Tool`
     */
    [...appletStore.listOfLoadedApplets].forEach((applet) => {
      if (applet.type === AppletType.Page) {
        return
      }

      if (this.groupByCategory) {
        listOfCategoriesAndApplets[applet.category].push(applet)
      } else {
        listOfCategoriesAndApplets.General.push(applet)
      }
    })

    /**
     * Sort by applets name if enabled
     */
    if (this.sortNameAZ) {
      listOfCategoriesAndApplets = Object.fromEntries(
        Object.entries(listOfCategoriesAndApplets).map(([category, applets]) => {
          return [category, applets.sort((a, b) => a.name < b.name ? -1 : 0)]
        })
      )
    }

    /**
     * Sort by applet categories if enabled
     */
    if (this.sortCategoryAZ) {
      listOfCategoriesAndApplets = Object.fromEntries(
        Object.entries(listOfCategoriesAndApplets).sort(([categoryA], [categoryB]) => {
          return categoryA < categoryB ? -1 : 0
        })
      )
    }

    /**
     * Remove applet category with empty applets
     */
    listOfCategoriesAndApplets = Object.fromEntries(
      Object.entries(listOfCategoriesAndApplets).filter(([, applets]) => {
        return applets.length > 0
      })
    )

    this.items = listOfCategoriesAndApplets
  }
}

export const toolSidebarService = new ToolSidebarService()
