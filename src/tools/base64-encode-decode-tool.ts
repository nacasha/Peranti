import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

const base64EncodeDecodeTool = new Tool({
  toolId: "base64-encode-decode",
  name: "Base64 Encode Decode",
  category: "Encode / Decode",
  layout: ToolLayoutEnum.SideBySide,
  inputs: [
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
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action({ input, type }: { input: string, type: string }) {
    if (type === "encode") {
      return { output: btoa(input) }
    }

    return { output: atob(input) }
  }
})

export default base64EncodeDecodeTool
