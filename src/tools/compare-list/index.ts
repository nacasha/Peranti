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
      component: "Textarea",
      defaultValue: "",
      props: { label: "List A" }
    },
    {
      key: "listB",
      component: "Textarea",
      defaultValue: "",
      props: { label: "List B" }
    }
  ],
  outputs: [
    {
      key: "onlyExistInputA",
      component: "Textarea",
      props: { label: "Only Exist In List A" }
    },
    {
      key: "output",
      component: "Textarea",
      props: { label: "Exist In Both List" }
    },
    {
      key: "onlyExistInputB",
      component: "Textarea",
      props: { label: "Only Exist In List B" }
    }
  ]
})

export default compareList
