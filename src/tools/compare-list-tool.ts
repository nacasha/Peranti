import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  listA: InputFieldsType.Code
  listB: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
  onlyExistInputA: OutputFieldsType.Code
  onlyExistInputB: OutputFieldsType.Code
}

const compareListTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "compare-lines",
  name: "Compare List",
  category: "List",
  layoutSetting: {
    direction: "vertical",
    inputAreaDirection: "horizontal",
    outputAreaDirection: "horizontal"
  },
  inputFields: [
    {
      key: "listA",
      label: "List A",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    },
    {
      key: "listB",
      label: "List B",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "onlyExistInputA",
      label: "Only Exist In List A",
      component: "Code"
    },
    {
      key: "output",
      label: "Exist In Both List",
      component: "Code"
    },
    {
      key: "onlyExistInputB",
      label: "Only Exist In List B",
      component: "Code"
    }
  ],
  action: (inputParams) => {
    const { listA, listB } = inputParams

    const linesA = listA.split("\n")
    const linesB = listB.split("\n")

    const bothExist = linesA.filter(line => linesB.includes(line)).join("\n")
    const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join("\n")
    const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join("\n")

    return { output: bothExist, onlyExistInputA, onlyExistInputB }
  }
}

export default compareListTool
