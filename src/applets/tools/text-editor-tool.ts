import { AppletConstructorModel } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

const textEditorTool = new AppletConstructorModel<InputFields>({
  appletId: "text-editor",
  name: "Text Editor",
  category: "Editor",
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
})

export default textEditorTool
