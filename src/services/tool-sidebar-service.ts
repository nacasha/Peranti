import { makeAutoObservable } from "mobx"

import { GlobalStyleVariables } from "src/constants/global-style-variables.js"
import { ToolSidebarItemHeight } from "src/constants/tool-sidebar-item-height"
import { ToolSidebarDensity } from "src/enums/tool-sidebar-density"
import { UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { type AppletConstructor } from "src/models/AppletConstructor.js"

import { appletStore } from "./applet-store.js"
import { globalStyles } from "./global-styles.js"
import { userSettingsService } from "./user-settings-service.js"

/**
 * Service to manage applets with type `Tool` to be showed on tool sidebar
 */
class ToolSidebarService {
  /**
   * Group applets by its category
   */
  @userSettingsService.watch(UserSettingsKeys.toolSidebarGroupByCategory)
  groupByCategory: boolean = userSettingsService.get(
    UserSettingsKeys.toolSidebarGroupByCategory,
    true
  )

  /**
   * Categories the user has collapsed. Stored as names rather than indexes so
   * the state survives re-sorting and newly loaded extensions.
   */
  @userSettingsService.watch(UserSettingsKeys.toolSidebarCollapsedCategories)
  collapsedCategories: string[] = userSettingsService.get(
    UserSettingsKeys.toolSidebarCollapsedCategories,
    []
  )

  /**
   * Show number of opened tabs beside each category
   */
  @userSettingsService.watch(UserSettingsKeys.toolSidebarShowGroupTabCount)
  showGroupTabCount: boolean = userSettingsService.get(
    UserSettingsKeys.toolSidebarShowGroupTabCount,
    true
  )

  /**
   * Show number of opened tabs beside each tool
   */
  @userSettingsService.watch(UserSettingsKeys.toolSidebarShowToolTabCount)
  showToolTabCount: boolean = userSettingsService.get(
    UserSettingsKeys.toolSidebarShowToolTabCount,
    true
  )

  /**
   * Row height of the tool items
   */
  @userSettingsService.watch(UserSettingsKeys.toolSidebarDensity)
  density: ToolSidebarDensity = userSettingsService.get(
    UserSettingsKeys.toolSidebarDensity,
    ToolSidebarDensity.Default
  )

  /**
   * Map key value of applet category and list of applet constructor
   */
  items: Record<string, AppletConstructor[]> = {}

  /**
   * Tool sidebar service constructor
   */
  constructor() {
    makeAutoObservable(this)
    userSettingsService.watchStore(this)
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
     * Filter applet that showable on sidebar
     */
    [...appletStore.listOfLoadedApplets].forEach((applet) => {
      if (applet.hideOnSidebar) {
        return
      }

      if (this.groupByCategory) {
        listOfCategoriesAndApplets[applet.category].push(applet)
      } else {
        listOfCategoriesAndApplets.General.push(applet)
      }
    })

    /**
     * Always sort applets and categories by name, A-Z. Case-insensitive, so
     * e.g. "Color" comes before "CSV" rather than after it.
     */
    const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" })

    listOfCategoriesAndApplets = Object.fromEntries(
      Object.entries(listOfCategoriesAndApplets)
        .map(([category, applets]) => [category, applets.sort((a, b) => byName(a.name, b.name))] as const)
        .sort(([categoryA], [categoryB]) => byName(categoryA, categoryB))
    )

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

  setGroupByCategory(value: boolean) {
    this.groupByCategory = value
    this.setupItems()
  }

  setShowGroupTabCount(value: boolean) {
    this.showGroupTabCount = value
  }

  setShowToolTabCount(value: boolean) {
    this.showToolTabCount = value
  }

  setDensity(density: ToolSidebarDensity) {
    this.density = density
    globalStyles.setVariable(GlobalStyleVariables.toolSidebarItemHeight, ToolSidebarItemHeight[density])
  }

  isCategoryCollapsed(category: string) {
    return this.collapsedCategories.includes(category)
  }

  toggleCategory(category: string) {
    this.collapsedCategories = this.isCategoryCollapsed(category)
      ? this.collapsedCategories.filter((name) => name !== category)
      : [...this.collapsedCategories, category]
  }

  expandAllCategories() {
    this.collapsedCategories = []
  }

  collapseAllCategories() {
    this.collapsedCategories = Object.keys(this.items)
  }
}

export const toolSidebarService = new ToolSidebarService()
