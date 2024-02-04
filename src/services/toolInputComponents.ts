import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { FileInput } from "src/components/inputs/FileInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput"
import { TextInput } from "src/components/inputs/TextInput"
import { ToolComponent } from "src/models/ToolComponent"

export const toolInputComponents = {
  /**
   * Checkbox input
   */
  Checkbox: new ToolComponent({
    component: CheckboxInput
  }),

  /**
   * Basic Text area input
   */
  TextArea: new ToolComponent({
    component: TextAreaInput,
    copyAs: "text",
    readFileMimes: ["text/*", "application/json"],
    readFileAs: "text"
  }),

  /**
   * Single line text input
   */
  Text: new ToolComponent({
    component: TextInput,
    batchComponent: "Code",
    copyAs: "text"
  }),

  /**
   * Select option input
   */
  Select: new ToolComponent({
    component: SelectInput
  }),

  /**
   * Switch true and false input
   */
  Switch: new ToolComponent({
    component: SwitchInput
  }),

  /**
   * Button to run active tool manually
   */
  Run: new ToolComponent({
    component: RunInput
  }),

  /**
   * File input
   */
  File: new ToolComponent({
    component: FileInput,
    readFileMimes: ["*"],
    readFileAs: "file"
  }),

  /**
   * Code editor input
   */
  Code: new ToolComponent({
    component: CodeInput,
    copyAs: "text",
    readFileMimes: ["text/*", "application/json"],
    readFileAs: "text"
  })
}
