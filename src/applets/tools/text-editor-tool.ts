import { type InputFieldsType } from "src/types/InputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

const textEditorTool: AppletConstructor<InputFields> = {
  appletId: "text-editor",
  name: "Text Editor",
  category: "Editor",
  layoutSetting: {
    gridTemplate: "1fr"
  },
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [],
  action: () => ({})
}

export default textEditorTool
