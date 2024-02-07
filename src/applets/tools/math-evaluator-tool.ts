import Mexp from "math-expression-evaluator"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const mathEvaluatorTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "math-evaluator",
  name: "Math Evaluator",
  category: "Math",
  inputFields: [
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
  action({ input }) {
    const mexp = new Mexp()

    const inputLines = input.split("\n")
    const outputLines = inputLines.map((input) => {
      if (input.trim().length === 0) return ""

      if (input.includes("//")) return ""

      try {
        const result = mexp.eval(input, [], {}).toString()
        return result
      } catch (e) {
        return "Invalid"
      }
    })
    const output = outputLines.join("\n")

    return { output }
  }
}

export default mathEvaluatorTool
