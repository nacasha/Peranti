import { Tool } from "../../types/Tool";
import { removeDuplicateLinesActions } from "./remove-duplicate-lines-action";

const removeDuplicateList: Tool = {
  id: "remove-duplicate-list",
  title: "Remove Duplicate List",
  category: "List",
  action: removeDuplicateLinesActions,
  inputs: [
    {
      field: "input",
      component: "Textarea",
      defaultValue: "",
    }
  ],
  outputs: [
    {
      field: "output",
      component: "Textarea",
    }
  ]
}

export default removeDuplicateList
