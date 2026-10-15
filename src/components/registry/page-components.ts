import { AppletComponent } from "src/models/AppletComponent"
import { ExtensionPage } from "src/pages/ExtensionPage"
import { ExtensionsPage } from "src/pages/ExtensionsPage"
import { HistoryPage } from "src/pages/HistoryPage"
import { PipelineEditor } from "src/pages/PipelineEditorPage"
import { SettingsPage } from "src/pages/SettingsPage"
import { WorkbenchPage } from "src/pages/WorkbenchPage"

/**
 * Whole pages, opened as a tab with the page as its only input. They're looked
 * up like input components, but never offered as a field
 */
export const pageComponents = {
  PipelineEditor: new AppletComponent({ component: PipelineEditor, hideInHistory: true }),
  Settings: new AppletComponent({ component: SettingsPage, hideInHistory: true }),
  History: new AppletComponent({ component: HistoryPage, hideInHistory: true }),
  Extensions: new AppletComponent({ component: ExtensionsPage, hideInHistory: true }),
  Workbench: new AppletComponent({ component: WorkbenchPage, hideInHistory: true }),
  ExtensionPage: new AppletComponent({ component: ExtensionPage, hideInHistory: true })
}

export type PageComponents = typeof pageComponents
