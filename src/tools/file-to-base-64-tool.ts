import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.File
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const toBase64 = async(file: File) => await new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => { resolve(reader.result?.toString() ?? "") }
  reader.onerror = reject
})

const fileToBase64Tool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "file-to-base64-encode",
  name: "File to Base64",
  category: "File",
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "File",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  async action({ input }) {
    if (input) {
      const file = input[0]
      const base64 = await toBase64(file)
      return { output: base64 }
    }

    return { output: "" }
  }
}

export default fileToBase64Tool
