import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.File
}

const base64ToFileTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "base64-to-file",
  name: "Base64 To File",
  category: "File",
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
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "File"
    }
  ],
  async action({ input }) {
    if (input.trim().length === 0) {
      return { output: [] }
    }

    return { output: [input] }
  }
}

export default base64ToFileTool
