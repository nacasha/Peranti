import { Tool } from "../../types/Tool";
import { compareLinesAction } from "./compare-lines-action";

const compareLines: Tool = {
  id: "compare-lines",
  title: "Compare Lines",
  action: compareLinesAction,
  inputs: [
    {
      field: "inputA",
      component: "SingleTextareaInput",
      defaultValue: "",
      props: { label: "Input A" }
    },
    {
      field: "inputB",
      component: "SingleTextareaInput",
      defaultValue: "",
      props: { label: "Input B" }
    },
  ],
  outputs: [
    {
      field: "onlyExistInputA",
      component: "SingleTextOutput",
      props: { label: "Only Exist In List A" }
    },
    {
      field: "output",
      component: "SingleTextOutput",
      props: { label: "Exist In Both List" }
    },
    {
      field: "onlyExistInputB",
      component: "SingleTextOutput",
      props: { label: "Only Exist In List B" }
    }
  ]
}

export default compareLines
