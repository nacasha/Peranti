import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  file: InputFieldsType.File
}

interface OutputFields {
  output: OutputFieldsType.Code
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
  layoutSetting: {
    direction: "vertical",
    inputAreaSize: "auto"
  },
  inputFields: [
    {
      key: "file",
      label: "Input",
      component: "File",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  async action({ file }) {
    if (file) {
      const base64 = await toBase64(file)
      return { output: base64 }
    }

    return { output: "" }
  }
}

export default fileToBase64Tool
