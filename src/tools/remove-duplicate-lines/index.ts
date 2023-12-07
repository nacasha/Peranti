import { Tool } from "src/models/Tool"
import { removeDuplicateLinesActions } from "./remove-duplicate-lines-action"

const removeDuplicateList = new Tool({
  id: "remove-duplicate-list",
  name: "Remove Duplicate List",
  category: "List",
  action: removeDuplicateLinesActions,
  inputs: [
    {
      key: "input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default removeDuplicateList
