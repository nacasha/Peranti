import cronstrue from "cronstrue"
import "cronstrue/locales/id"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

interface InputFields {
  input: string
}

interface OutputFields {
  output: string
}

const cronReadableTool = new Tool<InputFields, OutputFields>({
  toolId: "cron-parser",
  name: "CRON Parser",
  category: "Date Time",
  layout: ToolLayoutEnum.SideBySide,
  inputs: [
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
    const { input } = inputParams
    if (input.trim().length === 0) {
      return { output: "" }
    }

    const inputLines = input.split("\n")

    const outputLines = inputLines.map((line) => {
      try {
        return cronstrue.toString(line, { locale: "id" })
      } catch {
        return "Invalid CRON Format"
      }
    })
    const output = outputLines.join("\n")

    return { output }
  }
})

export default cronReadableTool
