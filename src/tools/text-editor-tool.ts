import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
}

const textEditorTool: ToolConstructor<InputFields> = {
  toolId: "text-editor",
  name: "Text Editor",
  category: "Editor",
  layout: ToolLayoutEnum.TopBottomAndPushToBottom,
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
