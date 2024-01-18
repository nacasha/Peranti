import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Textarea
}

interface OutputFields {
  output: OutputFieldsType.File
}

const base64ToFileTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "base64-to-file",
  name: "Base64 To File",
  category: "File",
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
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
    return { output: input }
  }
}

export default base64ToFileTool
