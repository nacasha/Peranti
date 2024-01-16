import Mexp from "math-expression-evaluator"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const mathEvaluatorTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "math-evaluator",
  name: "Math Evaluator",
  category: "Math",
  layout: ToolLayoutEnum.SideBySide,
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
  action({ input }) {
    const mexp = new Mexp()

    const inputLines = input.split("\n")
    const outputLines = inputLines.map((input) => {
      if (input.trim().length === 0) return ""

      if (input.includes("//")) return ""

      try {
        const result = mexp.eval(input, [], {}).toString()
        return result.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      } catch (e) {
        return "Invalid"
      }
    })
    const output = outputLines.join("\n")

    return { output }
  }
}

export default mathEvaluatorTool
