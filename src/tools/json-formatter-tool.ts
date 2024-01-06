import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

interface InputFields {
  input: string
  type: string
}

interface OutputFields {
  output: unknown
}

const jsonFormatter = new Tool<InputFields, OutputFields>({
  toolId: "json-formatter",
  name: "JSON Formatter",
  category: "JSON",
  layout: ToolLayoutEnum.SideBySide,
  inputs: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "pretty",
      props: {
        options: [
          { value: "minify", label: "Minify" },
          { value: "pretty", label: "Pretty" }
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
  action: (inputParams) => {
    const { input, type } = inputParams
    if (input.trim().length === 0) return { output: "" }

    try {
      const isPretty = type === "pretty"
      const jsonObj = JSON.parse(input)
      const output = JSON.stringify(jsonObj, null, isPretty ? 2 : undefined)
      return { output }
    } catch (error) {
      if (error instanceof Error) {
        const output = `Error formatting JSON: ${error.message}`
        return { output }
      } else {
        return { output: "Unknown Error" }
      }
    }
  }
})

export default jsonFormatter
