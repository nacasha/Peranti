import { Tool } from "../../types/Tool";
import { removeDuplicateLinesActions } from "./remove-duplicate-lines-action";

const removeDuplicateLines: Tool = {
  id: "remove-duplicate-lines",
  title: "Remove Duplicate Lines",
  action: removeDuplicateLinesActions,
  inputs: [
    {
      field: "input",
      component: "SingleTextareaInput",
      defaultValue: "",
    }
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    }
  ]
}

export default removeDuplicateLines
