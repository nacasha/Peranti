import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Switch
  type: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const uriEncodeDecodeTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "uri-encode-decode",
  name: "URI Encode Decode",
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
  action({ input, type }) {
    if (type === "encode") {
      return { output: encodeURIComponent(input) }
    }

    return { output: decodeURIComponent(input) }
  }
}

export default uriEncodeDecodeTool
