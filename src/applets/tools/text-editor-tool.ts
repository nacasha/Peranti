import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"

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
  outputFields: []
}

export default textEditorTool
