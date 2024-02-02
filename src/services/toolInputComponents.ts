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
  Checkbox: new ToolComponent({
    component: CheckboxInput
  }),

  TextArea: new ToolComponent({
    component: TextAreaInput,
    copyAs: "text",
    pasteFromFileMimes: ["txt"]
  }),

  Text: new ToolComponent({
    component: TextInput,
    batchComponent: CodeInput,
    copyAs: "text",
    pasteFromFileMimes: ["txt"]
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
    component: FileInput
  }),

  Code: new ToolComponent({
    component: CodeInput,
    copyAs: "text",
    pasteFromFileMimes: ["txt"]
  })
}
