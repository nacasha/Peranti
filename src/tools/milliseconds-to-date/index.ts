import { Tool } from "src/models/Tool"

import { millisecondsToDateAction } from "./milliseconds-to-date-action.js"

const millisecondsToDate = new Tool({
  toolId: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  action: millisecondsToDateAction,
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

export default millisecondsToDate
