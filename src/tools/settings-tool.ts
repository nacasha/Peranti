import { type InputFieldsType } from "src/types/InputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

const settingsTool: ToolConstructor<InputFields> = {
  toolId: "settings-tool",
  name: "Settings",
  category: "App",
  layoutSetting: {
    gridTemplate: "1fr"
  },
  inputFields: [],
  outputFields: [
    {
      key: "web",
      label: "Web",
      component: "Settings"
    }
  ],
  disableMultipleSession: true,
  hideOnSidebar: true
}

export default settingsTool
