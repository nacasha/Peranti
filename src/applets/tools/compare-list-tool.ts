import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  listA: InputFieldsType.Code
  listB: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
  onlyExistInputA: OutputFieldsType.Code
  onlyExistInputB: OutputFieldsType.Code
}

const compareListTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "compare-lines",
  name: "Compare List",
  category: "List",
  layoutSetting: {
    areaType: "flex",
    areaFlexDirection: "vertical",

    fieldsType: "flex",
    fieldsInputFlexDirection: "horizontal",
    fieldsOutputFlexDirection: "horizontal"
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
  samples: [
    {
      name: "Sample 1",
      inputValues: {
        listA: "Item 1\nItem 2\nItem 3\nItem 4\nItem 5",
        listB: "Item 1\nItem 3\nItem 4\nItem 6"
      }
    },
    {
      name: "Sample 2",
      inputValues: {
        listA: "dc72a490\ndc72a491\ndc72a492\ndc72a493\ndc72a494",
        listB: "dc72a490\ndc72a491\ndc72a492\ndc72a493\ndc72a494"
      }
    }
  ],
  action: ({ inputValues }) => {
    const { listA, listB } = inputValues

    const linesA = listA.split("\n")
    const linesB = listB.split("\n")

    const bothExist = linesA.filter(line => linesB.includes(line)).join("\n")
    const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join("\n")
    const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join("\n")

    return { output: bothExist, onlyExistInputA, onlyExistInputB }
  }
}

export default compareListTool
