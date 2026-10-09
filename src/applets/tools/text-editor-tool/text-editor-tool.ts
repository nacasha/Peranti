import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

export const textEditorTool = new AppletConstructor<InputFields>({
  appletId: "text-editor",
  fileExtensions: ["txt", "log", "md"],
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
