import toast from "react-hot-toast"

import { FileNames } from "src/constants/file-names"
import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"
import { type ExtensionTool } from "src/types/ExtensionTool"

import { appDataService } from "./app-data-service.js"
import { fileService } from "./file-service.js"

class ExtensionsService {
  private async buildAppletConstructor(path: string, extensionRawFile: string) {
    const extension: ExtensionTool = JSON.parse(extensionRawFile)
    const realActionFilePath = await fileService.resolveFilePath(path, extension.actionFile)

    const appletConstructor: AppletConstructor = {
      appletId: extension.toolId,
      name: extension.name,
      category: extension.category,
      inputFields: extension.inputFields,
      outputFields: extension.outputFields,
      layoutSetting: extension.layoutSetting,
      autoRun: extension.autoRun,
      type: AppletType.Extension,
      samples: extension.samples,
      disableMultipleSession: extension.disableMultipleSession,
      metadata: {
        actionFile: realActionFilePath,
        dependencies: {
          builtin: extension.dependencies?.builtin ?? [],
          external: extension.dependencies?.external ?? []
        }
      }
    }

    return appletConstructor
  }

  async getExtensionsAsAppletContructor() {
    const extensions = []
    const entries = await appDataService.readExtensionsFolder()

    /**
     * Iterate all folder in extensions folder
     */
    for (const entry of entries) {
      try {
        if (entry.children) {
          /**
           * Make sure the folder has extension definition file
           */
          if (!entry.children.some((file) => file.name === FileNames.ExtensionDefinition)) {
            toast.error(`Folder ${entry.name} does not have ${FileNames.ExtensionDefinition} file`)
            continue
          }

          const files = Object.fromEntries(entry.children.map((children) => [children.name, children.path]))

          const extensionRawFile = await fileService.readFileAsText(files[FileNames.ExtensionDefinition])
          const appletConstructor = await this.buildAppletConstructor(entry.path, extensionRawFile)

          extensions.push(appletConstructor)
        }
      } catch (exception) {
        toast.error(`Failed to read ${entry.name} extension`)
        console.log(exception)
      }
    }

    return extensions
  }
}

export const extensionsService = new ExtensionsService()
