import jsonata from "jsonata"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  jsonString: InputFieldsType.Code
  expression: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const jsonataTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "jsonata",
  name: "JSONata",
  category: "JSON",
  inputFields: [
    {
      key: "expression",
      label: "Expression",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    },
    {
      key: "jsonString",
      label: "JSON",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Result",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  action: async(inputParams) => {
    const { jsonString, expression } = inputParams

    if (jsonString.trim().length === 0 || expression.trim().length === 0) {
      return { output: "" }
    }

    try {
      const jsonData = JSON.parse(jsonString)
      const jsonataExpression = jsonata(expression)
      const output = await jsonataExpression.evaluate(jsonData)

      return { output }
    } catch (e: any) {
      if (e?.message) {
        return { output: e?.message }
      }

      return { output: "Error" }
    }
  }
}

export default jsonataTool
