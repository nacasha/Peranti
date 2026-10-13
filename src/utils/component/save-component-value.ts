import { type AppletComponent } from "src/models/AppletComponent.js"
import { fileService } from "src/services/file-service.js"

export async function saveComponentValue(component: AppletComponent, value: any) {
  if (!value) {
    return
  }

  if (component.saveAs === "text") {
    await fileService.saveToTextFile(value)
  } else if (component.saveAs === "image") {
    await fileService.saveToImageFile(value)
  }
}
