import jsonata from "jsonata"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  jsonString: string
  expression: string
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const jsonataTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "jsonata",
  name: "JSONata",
  category: "JSON",
  layout: ToolLayoutEnum.SideBySide,
  inputFields: [
    {
      key: "jsonString",
      label: "JSON",
      component: "Textarea",
      defaultValue: "",
      props: {
        language: "json"
      }
    },
    {
      key: "expression",
      label: "Expression",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Result",
      component: "Textarea",
      props: {
        language: "json"
      }
    }
  ],
  action: async(inputParams) => {
    const { jsonString, expression } = inputParams

    /**
     * Return empty output if one of the inputs are empty
     */
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
