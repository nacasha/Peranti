import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  type: InputFieldsType.Switch
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
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
      component: "Code"
    }
  ],
  action({ input, type }) {
    try {
      if (type === "encode") {
        return { output: btoa(input) }
      }
      return { output: atob(input) }
    } catch (error) {
      if (type === "encode") {
        return { output: "Unable to encode text" }
      }
      return { output: "Unable to decode text" }
    }
  }
}

export default base64EncodeDecodeTool
