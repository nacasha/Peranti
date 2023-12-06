import { Tool } from "../../types/Tool";
import { compareListAction } from "./compare-lines-action";

const compareList: Tool = {
  id: "compare-lines",
  title: "Compare List",
  category: "List",
  action: compareListAction,
  inputs: [
    {
      field: "listA",
      component: "Textarea",
      defaultValue: "",
      props: { label: "List A" }
    },
    {
      field: "listB",
      component: "Textarea",
      defaultValue: "",
      props: { label: "List B" }
    },
  ],
  outputs: [
    {
      field: "onlyExistInputA",
      component: "Textarea",
      props: { label: "Only Exist In List A" }
    },
    {
      field: "output",
      component: "Textarea",
      props: { label: "Exist In Both List" }
    },
    {
      field: "onlyExistInputB",
      component: "Textarea",
      props: { label: "Only Exist In List B" }
    }
  ]
}

export default compareList
