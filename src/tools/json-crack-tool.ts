import { type InputFieldsType } from "src/types/InputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

const jsonCrackTool: ToolConstructor<InputFields> = {
  toolId: "json-crack",
  name: "JSON Crack",
  category: "Online Web Tools",
  layoutSetting: {
    gridTemplate: "1fr"
  },
  inputFields: [],
  outputFields: [
    {
      key: "web",
      label: "Web",
      component: "IFrame"
    }
  ],
  action: () => ({})
}

export default jsonCrackTool
