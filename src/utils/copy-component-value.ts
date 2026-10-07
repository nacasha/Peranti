import { type AppletComponent } from "src/models/AppletComponent.js"
import { ClipboardService } from "src/services/clipboard-service.js"

/**
 * Returns true when the value was written to the clipboard
 */
export async function copyComponentValue(component: AppletComponent, value: any) {
  if (!value) {
    return false
  }

  if (component.copyAs === "text") {
    await ClipboardService.copyAsText(value)
    return true
  }

  return false
}
