import cronstrue from "cronstrue"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const cronReadableTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "cron-parser",
  name: "CRON Parser",
  category: "Date Time",
  layoutSetting: {
    direction: "vertical",
    gridTemplate: "auto 1fr"
  },
  inputFields: [
    {
      key: "input",
      label: "CRON Expression",
      component: "Text",
      defaultValue: "",
      allowBatch: true,
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Text",
      allowBatch: true
    }
  ],
  samples: [
    { input: "* * * * * *" },
    { input: "* * * * *" },
    { input: "0 0/30 * * * *" },
    { input: "0 0 * * * *" }
  ],
  action: (inputParams) => {
    const { input } = inputParams
    if (input.trim().length === 0) {
      return { output: "" }
    }

    const inputLines = input.split("\n")

    const outputLines = inputLines.map((line) => {
      try {
        return cronstrue.toString(line)
      } catch {
        return "Invalid CRON Format"
      }
    })
    const output = outputLines.join("\n")

    return { output }
  }
}

export default cronReadableTool
