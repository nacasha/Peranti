import { Tool } from "src/models/Tool"

import { removeDuplicateLinesActions } from "./remove-duplicate-lines-action.ts"

const removeDuplicateList = new Tool({
  toolId: "remove-duplicate-list",
  name: "Remove Duplicate List",
  category: "List",
  action: removeDuplicateLinesActions,
  inputs: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ]
})

export default removeDuplicateList
