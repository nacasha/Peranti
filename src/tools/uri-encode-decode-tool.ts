import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
  type: string
}

interface OutputFields {
  output: unknown
}

const uriEncodeDecodeTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "uri-encode-decode",
  name: "URL Encode Decode",
  category: "Encode / Decode",
  layout: ToolLayoutEnum.SideBySide,
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
      return { output: encodeURIComponent(input) }
    }

    return { output: decodeURIComponent(input) }
  }
}

export default uriEncodeDecodeTool
