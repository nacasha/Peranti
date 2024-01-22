import { type InputFieldsType } from "src/types/InputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

const textEditorTool: ToolConstructor<InputFields> = {
  toolId: "text-editor",
  name: "Text Editor",
  category: "Editor",
  layoutSetting: {
    outputAreaSize: "0"
  },
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [],
  action: () => ({})
}

export default textEditorTool
