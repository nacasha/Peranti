import Mexp from "math-expression-evaluator"

import { AppletConstructorModel } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const mathEvaluatorTool = new AppletConstructorModel<InputFields, OutputFields>({
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
  samples: [
    {
      name: "Sample 1",
      inputValues: {
        input: "(100 * 145) + 10"
      }
    },
    {
      name: "Sample 2",
      inputValues: {
        input: "1500 + 2030 * 10 - (10 * 50)"
      }
    }
  ],
  action({ inputValues }) {
    const { input } = inputValues
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
})

export default mathEvaluatorTool
