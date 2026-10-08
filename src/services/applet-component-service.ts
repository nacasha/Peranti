import { open } from "@tauri-apps/plugin-dialog"
import toast from "react-hot-toast"

import { ColorHistory } from "src/components/history/ColorHistory"
import { ColorPalleteHistory } from "src/components/history/ColorPalleteHistory"
import { FileHistory } from "src/components/history/FileHistory"
import { GridStatHistory } from "src/components/history/GridStatHistory"
import { ImageHistory } from "src/components/history/ImageHistory"
import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { ColorPickerInput } from "src/components/inputs/ColorPickerInput"
import { FileInput, FilesInput } from "src/components/inputs/FileInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput-2"
import { TextInput } from "src/components/inputs/TextInput"
import { CodeOutput } from "src/components/outputs/CodeOutput"
import { ColorOutput } from "src/components/outputs/ColorOutput"
import { ColorPalleteOutput } from "src/components/outputs/ColorPalleteOutput"
import { DataGridOutput } from "src/components/outputs/DataGridOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { KeyValueOutput } from "src/components/outputs/KeyValueOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { MermaidOutput } from "src/components/outputs/MermaidOutput"
import { PintoraOutput } from "src/components/outputs/PintoraOutput"
import { ReactOutput } from "src/components/outputs/ReactOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput-2"
import { TextOutput } from "src/components/outputs/TextOutput"
import { AppletComponent } from "src/models/AppletComponent.js"
import { HistoryPage } from "src/pages/HistoryPage"
import { PipelineEditor } from "src/pages/PipelineEditorPage"
import { SettingsPage } from "src/pages/SettingsPage"
import { convertCRLFtoLF } from "src/utils/convert-crlf-to-lf.js"
import { createFileFromUint32Array } from "src/utils/create-file-from-uint32-array.js"
import { getFileNameFromPath } from "src/utils/get-file-name-from-path.js"

import { fileService } from "./file-service.js"

class AppletComponentService {
  /**
   * Map of key and input components
   */
  readonly inputs = {
    Checkbox: new AppletComponent({
      component: CheckboxInput,
      hideInHistory: true
    }),

    TextArea: new AppletComponent({
      component: TextAreaInput,
      maximizable: true,
      copyAs: "text",
      saveAs: "text",
      readFileAs: "text"
    }),

    Text: new AppletComponent({
      component: TextInput,
      batchComponent: "Code",
      copyAs: "text"
    }),

    Select: new AppletComponent({
      component: SelectInput,
      hideInHistory: true
    }),

    Switch: new AppletComponent({
      component: SwitchInput,
      hideInHistory: true
    }),

    Run: new AppletComponent({
      component: RunInput,
      hideInHistory: true
    }),

    File: new AppletComponent({
      component: FileInput,
      readFileAs: "file",
      historyComponent: FileHistory
    }),

    Files: new AppletComponent({
      component: FilesInput,
      readFileAs: "files",
      historyComponent: FileHistory
    }),

    Code: new AppletComponent({
      component: CodeInput,
      maximizable: true,
      copyAs: "text",
      saveAs: "text",
      readFileAs: "text"
    }),

    PipelineEditor: new AppletComponent({
      component: PipelineEditor,
      hideInHistory: true
    }),

    ColorPicker: new AppletComponent({
      component: ColorPickerInput,
      maximizable: true,
      historyComponent: ColorHistory
    })
  }

  /**
   * Map of key and output components
   */
  readonly outputs = {
    Code: new AppletComponent({
      component: CodeOutput,
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    // Both sides of the diff are already the tab's inputs
    Diff: new AppletComponent({
      component: DiffOutput,
      maximizable: true,
      hideInHistory: true
    }),

    File: new AppletComponent({
      component: FileOutput,
      hideInHistory: true
    }),

    GridStat: new AppletComponent({
      component: GridStatOutput,
      historyComponent: GridStatHistory
    }),

    IFrame: new AppletComponent({
      component: IFrameOutput,
      hideInHistory: true
    }),

    Image: new AppletComponent({
      component: ImageOutput,
      maximizable: true,
      saveAs: "image",
      historyComponent: ImageHistory
    }),

    Markdown: new AppletComponent({
      component: MarkdownOutput,
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    TextArea: new AppletComponent({
      component: TextAreaOutput,
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    Text: new AppletComponent({
      component: TextOutput,
      batchComponent: "Code",
      copyAs: "text",
      saveAs: "text"
    }),

    Mermaid: new AppletComponent({
      component: MermaidOutput,
      maximizable: true
    }),

    Pintora: new AppletComponent({
      component: PintoraOutput,
      maximizable: true
    }),

    React: new AppletComponent({
      component: ReactOutput,
      maximizable: true,
      hideInHistory: true
    }),

    Settings: new AppletComponent({
      component: SettingsPage,
      hideInHistory: true
    }),

    History: new AppletComponent({
      component: HistoryPage,
      hideInHistory: true
    }),

    DataGrid: new AppletComponent({
      component: DataGridOutput,
      maximizable: true,
      hideInHistory: true
    }),

    Color: new AppletComponent({
      component: ColorOutput,
      historyComponent: ColorHistory
    }),

    ColorPallete: new AppletComponent({
      component: ColorPalleteOutput,
      historyComponent: ColorPalleteHistory
    }),

    KeyValue: new AppletComponent({
      component: KeyValueOutput,
      batchComponent: "Code",
      hideInHistory: true
    })
  }

  /**
   * List of input component keys
   */
  get listOfInputs() {
    return Object.keys(this.inputs)
  }

  /**
   * List of output component keys
   */
  get listOfOutputs() {
    return Object.keys(this.outputs)
  }

  /**
   * Get input component or batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getInputComponent(componentName: keyof typeof this.inputs, isBatchComponent: boolean = false) {
    const inputComponent = this.inputs[componentName]
    if (isBatchComponent) {
      const inputComponentBatch = this.inputs[inputComponent.batchComponent as keyof typeof this.inputs]
      if (inputComponentBatch) {
        return inputComponentBatch
      }
      return inputComponent
    }
    return inputComponent
  }

  /**
   * Get output component or batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getOutputComponent(componentName: keyof typeof this.outputs, isBatchComponent: boolean = false) {
    const outputComponent = this.outputs[componentName]
    if (isBatchComponent) {
      const outputComponentBatch = this.outputs[outputComponent.batchComponent as keyof typeof this.outputs]
      if (outputComponentBatch) {
        return outputComponentBatch
      }
      return outputComponent
    }
    return outputComponent
  }

  /**
   * Read file as content based on component type
   *
   * @param component
   * @param filePath
   * @returns
   */
  async readFileFromComponent(component: AppletComponent, filePath: string) {
    const readFileAs = component.readFileAs
    const fileName = getFileNameFromPath(filePath)

    try {
      if (readFileAs === "text") {
        const fileContent = await fileService.readFileAsText(filePath)
        return convertCRLFtoLF(fileContent)
      } else if (readFileAs === "file" || readFileAs === "files") {
        const file = await fileService.readFileAsBinary(filePath)
        return createFileFromUint32Array(file, getFileNameFromPath(filePath))
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} as ${readFileAs}`)
    }
  }

  /**
   * Read several files at once. Components reading as "files" get every file
   * as a single File[] value, other components only get the first file.
   *
   * @param component
   * @param filePaths
   * @returns
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
   * Open OS file picker / manager to choose file, and open the file as content
   * based on component type
   *
   * @param component
   * @returns
   */
  async openFileAndReadFromComponent(component: AppletComponent) {
    if (component.readFileAs === "files") {
      const selectedFilePaths = await open({ multiple: true })

      if (selectedFilePaths && selectedFilePaths.length > 0) {
        return await this.readFilesFromComponent(component, selectedFilePaths)
      }

      return
    }

    const selectedFilePath = await open()

    // Since plugin-dialog v2 `open()` resolves to the path itself, not a file object
    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await this.readFileFromComponent(component, selectedFilePath)
    }
  }
}

export const appletComponentService = new AppletComponentService()
