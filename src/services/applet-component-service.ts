import { open } from "@tauri-apps/plugin-dialog"
import toast from "react-hot-toast"

import { type InputComponents } from "src/components/registry/input-components"
import { type OutputComponents } from "src/components/registry/output-components"
import { type PageComponents } from "src/components/registry/page-components"
import { type AppletComponent } from "src/models/AppletComponent.js"
import { createFileFromUint32Array } from "src/utils/file/create-file-from-uint32-array.js"
import { getFileNameFromPath } from "src/utils/file/get-file-name-from-path.js"
import { convertCRLFtoLF } from "src/utils/text/convert-crlf-to-lf.js"

import { extensionComponentRegistry } from "./extension-component-registry.tsx"
import { fileService } from "./file-service.js"

/**
 * Pages are looked up by name like input components
 */
type AllInputComponents = InputComponents & PageComponents

export type InputComponentName = keyof AllInputComponents
export type OutputComponentName = keyof OutputComponents

interface BuiltInComponents {
  inputs: InputComponents
  outputs: OutputComponents
  pages: PageComponents
}

/**
 * Looks up the component a field names, built-in or from an extension, and
 * reads files into it.
 *
 * The built-in components are handed over at startup by
 * `registerBuiltInComponents` (src/components/registry).
 */
class AppletComponentService {
  private builtIn?: BuiltInComponents & { inputsWithPages: AllInputComponents }

  register(components: BuiltInComponents) {
    this.builtIn = {
      ...components,
      inputsWithPages: { ...components.inputs, ...components.pages }
    }
  }

  private getBuiltIn() {
    if (!this.builtIn) {
      throw new Error("Built-in components are used before registerBuiltInComponents() ran")
    }

    return this.builtIn
  }

  /**
   * Input components by name, pages included
   */
  get inputs(): AllInputComponents {
    return this.getBuiltIn().inputsWithPages
  }

  get outputs(): OutputComponents {
    return this.getBuiltIn().outputs
  }

  /**
   * Names of the input components a field can use, pages left out
   */
  get listOfInputs() {
    return Object.keys(this.getBuiltIn().inputs)
  }

  get listOfOutputs() {
    return Object.keys(this.getBuiltIn().outputs)
  }

  isPageComponent(componentName: string) {
    return componentName in this.getBuiltIn().pages
  }

  /**
   * The input component a field names. In batch mode, its batch component if
   * it has one, e.g. Code for Text, so each line can be typed
   */
  getInputComponent(componentName: InputComponentName, isBatchMode: boolean = false): AppletComponent {
    // Extension components have no batch variant
    if (extensionComponentRegistry.isExtensionComponent(componentName)) {
      return extensionComponentRegistry.getInput(componentName)
    }

    const component: AppletComponent = this.inputs[componentName]
    const batchComponent = this.inputs[component?.batchComponent as InputComponentName]

    return isBatchMode && batchComponent ? batchComponent : component
  }

  /**
   * The output component a field names, see `getInputComponent`
   */
  getOutputComponent(componentName: OutputComponentName, isBatchMode: boolean = false): AppletComponent {
    if (extensionComponentRegistry.isExtensionComponent(componentName)) {
      return extensionComponentRegistry.getOutput(componentName)
    }

    const component: AppletComponent = this.outputs[componentName]
    const batchComponent = this.outputs[component?.batchComponent as OutputComponentName]

    return isBatchMode && batchComponent ? batchComponent : component
  }

  /**
   * Reads a file the way the component takes it: as text, or as a File.
   * Shows a toast and returns undefined when it can't be read
   */
  async readFileFromComponent(component: AppletComponent, filePath: string) {
    const fileName = getFileNameFromPath(filePath)

    try {
      if (component.readFileAs === "text") {
        return convertCRLFtoLF(await fileService.readFileAsText(filePath))
      }

      if (component.readFileAs === "file" || component.readFileAs === "files") {
        return createFileFromUint32Array(await fileService.readFileAsBinary(filePath), fileName)
      }
    } catch (error) {
      console.error(error)
      toast.error(`Unable to read ${fileName} as ${component.readFileAs}`)
    }
  }

  /**
   * Reads several files. A component that reads "files" gets all of them as
   * one File[], any other component only gets the first one
   */
  async readFilesFromComponent(component: AppletComponent, filePaths: string[]) {
    if (component.readFileAs !== "files") {
      return await this.readFileFromComponent(component, filePaths[0])
    }

    const files = await Promise.all(
      filePaths.map(async(filePath) => await this.readFileFromComponent(component, filePath))
    )
    const readFiles = files.filter((file): file is File => file instanceof File)

    return readFiles.length > 0 ? readFiles : undefined
  }

  /**
   * Lets the user pick a file (or several, for a "files" component) and reads
   * it into the component. Undefined when the picker is cancelled
   */
  async openFileAndReadFromComponent(component: AppletComponent) {
    if (component.readFileAs === "files") {
      const filePaths = await open({ multiple: true })

      return filePaths && filePaths.length > 0
        ? await this.readFilesFromComponent(component, filePaths)
        : undefined
    }

    // Since plugin-dialog v2, `open()` resolves to the path itself
    const filePath = await open()

    return filePath && !Array.isArray(filePath)
      ? await this.readFileFromComponent(component, filePath)
      : undefined
  }
}

export const appletComponentService = new AppletComponentService()
