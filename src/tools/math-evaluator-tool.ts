import Mexp from "math-expression-evaluator"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

const mathEvaluatorTool = new Tool({
  toolId: "math-evaluator",
  name: "Math Evaluator",
  category: "Math",
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
  action({ input }: { input: string }) {
    const mexp = new Mexp()

    const inputLines = input.split("\n")
    const outputLines = inputLines.map((input) => {
      if (input.trim().length === 0) return ""

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
})

export default mathEvaluatorTool
