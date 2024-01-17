import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
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
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [],
  action: () => ({})
}

export default textEditorTool
