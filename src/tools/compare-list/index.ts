import { Tool } from "src/models/Tool"

import { compareListAction } from "./compare-lines-action.ts"

const compareList = new Tool({
  toolId: "compare-lines",
  name: "Compare List",
  category: "List",
  layout: "top-bottom",
  action: compareListAction,
  inputsLayoutDirection: "horizontal",
  outputsLayoutDirection: "horizontal",
  inputs: [
    {
      key: "listA",
      label: "List A",
      component: "Textarea",
      defaultValue: ""
    },
    {
      key: "listB",
      label: "List B",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "onlyExistInputA",
      label: "Only Exist In List A",
      component: "Textarea"
    },
    {
      key: "output",
      label: "Exist In Both List",
      component: "Textarea"
    },
    {
      key: "onlyExistInputB",
      label: "Only Exist In List B",
      component: "Textarea"
    }
  ]
})

export default compareList
