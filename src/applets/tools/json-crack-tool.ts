import { type InputFieldsType } from "src/types/InputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

const jsonCrackTool: AppletConstructor<InputFields> = {
  appletId: "json-crack",
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
