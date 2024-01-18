import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
  type: string
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const base64EncodeDecodeTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "base64-encode-decode",
  name: "Base64 Encode Decode",
  category: "Encode / Decode",
  inputFields: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "encode",
      props: {
        options: [
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" }
        ]
      }
    },
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
      component: "Textarea"
    }
  ],
  action({ input, type }) {
    if (type === "encode") {
      return { output: btoa(input) }
    }

    return { output: atob(input) }
  }
}

export default base64EncodeDecodeTool
