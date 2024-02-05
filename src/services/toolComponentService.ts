import { open } from "@tauri-apps/api/dialog"

import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { FileInput } from "src/components/inputs/FileInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput"
import { TextInput } from "src/components/inputs/TextInput"
import { CodeOutput } from "src/components/outputs/CodeOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput"
import { TextOutput } from "src/components/outputs/TextOutput"
import { ToolComponent } from "src/models/ToolComponent"
import { convertCRLFtoLF } from "src/utils/convertCRLFtoLF"
import { createFileFromUint32Array } from "src/utils/createFileFromUint32Array"
import { getFileNameFromPath } from "src/utils/getFileNameFromPath.js"

import { FileService } from "./fileService.js"

class ToolComponentService {
  /**
   * List of input components
   */
  readonly inputs = {
    Checkbox: new ToolComponent({
      component: CheckboxInput
    }),

    TextArea: new ToolComponent({
      component: TextAreaInput,
      copyAs: "text",
      readFileMimes: ["text/*", "application/json"],
      readFileAs: "text"
    }),

    Text: new ToolComponent({
      component: TextInput,
      batchComponent: "Code",
      copyAs: "text"
    }),

    Select: new ToolComponent({
      component: SelectInput
    }),

    Switch: new ToolComponent({
      component: SwitchInput
    }),

    Run: new ToolComponent({
      component: RunInput
    }),

    File: new ToolComponent({
      component: FileInput,
      readFileMimes: ["*"],
      readFileAs: "file"
    }),

    Code: new ToolComponent({
      component: CodeInput,
      copyAs: "text",
      readFileMimes: ["text/*", "application/json"],
      readFileAs: "text"
    })
  }

  /**
   * List of output components
   */
  readonly outputs = {
    Code: new ToolComponent({
      component: CodeOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    Diff: new ToolComponent({
      component: DiffOutput
    }),

    File: new ToolComponent({
      component: FileOutput
    }),

    GridStat: new ToolComponent({
      component: GridStatOutput
    }),

    IFrame: new ToolComponent({
      component: IFrameOutput
    }),

    Image: new ToolComponent({
      component: ImageOutput,
      saveAs: "image"
    }),

    Markdown: new ToolComponent({
      component: MarkdownOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    TextArea: new ToolComponent({
      component: TextAreaOutput,
      copyAs: "text",
      saveAs: "text"
    }),

    Text: new ToolComponent({
      component: TextOutput,
      batchComponent: "Code",
      copyAs: "text",
      saveAs: "text"
    })
  }

  /**
   * Get input component definition based on isBatchComponent
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getInputComponent(componentName: keyof typeof this.inputs, isBatchComponent: boolean = false) {
    const inputComponent = this.inputs[componentName]
    const batchInputComponent = this.inputs[inputComponent.batchComponent as keyof typeof this.inputs]

    return isBatchComponent ? batchInputComponent : inputComponent
  }

  async readFileFromToolComponent(toolComponent: ToolComponent, filePath: string) {
    const readFileAs = toolComponent.readFileAs

    if (readFileAs === "text") {
      const fileContent = await FileService.readFileAsText(filePath)
      return convertCRLFtoLF(fileContent)
    } else if (readFileAs === "file") {
      const file = await FileService.readFileAsBinary(filePath)
      return createFileFromUint32Array(file, getFileNameFromPath(filePath))
    }
  }

  async openFileAndReadFromToolComponent(toolComponent: ToolComponent) {
    const selectedFilePath = await open()

    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await this.readFileFromToolComponent(toolComponent, selectedFilePath)
    }
  }

  /**
   * Get output component definition based on isBatchComponent
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getOutputComponent(componentName: keyof typeof this.outputs, isBatchComponent: boolean = false) {
    const outputComponent = this.outputs[componentName]
    const batchOutputComponent = this.outputs[outputComponent.batchComponent as keyof typeof this.outputs]

    return isBatchComponent ? batchOutputComponent : outputComponent
  }
}

export const toolComponentService = new ToolComponentService()
