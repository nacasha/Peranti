import { open } from "@tauri-apps/plugin-dialog"
import toast from "react-hot-toast"

import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { ColorPickerInput } from "src/components/inputs/ColorPickerInput"
import { FileInput } from "src/components/inputs/FileInput"
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
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { MermaidOutput } from "src/components/outputs/MermaidOutput"
import { PintoraOutput } from "src/components/outputs/PintoraOutput"
import { ReactOutput } from "src/components/outputs/ReactOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput-2"
import { TextOutput } from "src/components/outputs/TextOutput"
import { AppletComponent } from "src/models/AppletComponent.js"
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
      component: CheckboxInput
    }),

    TextArea: new AppletComponent({
      component: TextAreaInput,
      copyAs: "text",
      readFileAs: "text"
    }),

    Text: new AppletComponent({
      component: TextInput,
      batchComponent: "Code",
      copyAs: "text"
    }),

    Select: new AppletComponent({
      component: SelectInput
    }),

    Switch: new AppletComponent({
      component: SwitchInput
    }),

    Run: new AppletComponent({
      component: RunInput
    }),

    File: new AppletComponent({
      component: FileInput,
      readFileAs: "file"
    }),

    Code: new AppletComponent({
      component: CodeInput,
      copyAs: "text",
      saveAs: "text",
      readFileAs: "text"
    }),

    PipelineEditor: new AppletComponent({
      component: PipelineEditor
    }),

    ColorPicker: new AppletComponent({
      component: ColorPickerInput
    })
  }

  /**
   * Map of key and output components
   */
  readonly outputs = {
    Code: new AppletComponent({
      component: CodeOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    Diff: new AppletComponent({
      component: DiffOutput
    }),

    File: new AppletComponent({
      component: FileOutput
    }),

    GridStat: new AppletComponent({
      component: GridStatOutput
    }),

    IFrame: new AppletComponent({
      component: IFrameOutput
    }),

    Image: new AppletComponent({
      component: ImageOutput,
      saveAs: "image"
    }),

    Markdown: new AppletComponent({
      component: MarkdownOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    TextArea: new AppletComponent({
      component: TextAreaOutput,
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
      component: MermaidOutput
    }),

    Pintora: new AppletComponent({
      component: PintoraOutput
    }),

    React: new AppletComponent({
      component: ReactOutput
    }),

    Settings: new AppletComponent({
      component: SettingsPage
    }),

    DataGrid: new AppletComponent({
      component: DataGridOutput
    }),

    Color: new AppletComponent({
      component: ColorOutput
    }),

    ColorPallete: new AppletComponent({
      component: ColorPalleteOutput
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
      } else if (readFileAs === "file") {
        const file = await fileService.readFileAsBinary(filePath)
        return createFileFromUint32Array(file, getFileNameFromPath(filePath))
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} as ${readFileAs}`)
    }
  }

  /**
   * Open OS file picker / manager to choose file, and open the file as content
   * based on component type
   *
   * @param component
   * @returns
   */
  async openFileAndReadFromComponent(component: AppletComponent) {
    const selectedFilePath = await open()

    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await this.readFileFromComponent(component, selectedFilePath.path)
    }
  }
}

export const appletComponentService = new AppletComponentService()
