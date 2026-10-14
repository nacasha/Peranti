import { workbenchApplet } from "src/applets/pages/workbench-applet"
import { sessionStore } from "src/services/session-store"
import { workbenchPageStore } from "src/services/workbench-page-store"

/**
 * Open the Workbench on a component's playground, by the component's key
 */
export function openComponentInWorkbench(componentKey: string) {
  workbenchPageStore.openComponent(componentKey)
  sessionStore.findOrCreateSession(workbenchApplet)
}
