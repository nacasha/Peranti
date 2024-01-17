import cronstrue from "cronstrue"
import "cronstrue/locales/id"

import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const cronReadableTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "cron-parser",
  name: "CRON Parser",
  category: "Date Time",
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
}

export default cronReadableTool
