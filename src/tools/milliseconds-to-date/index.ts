import { type Tool } from "src/types/Tool"
import { millisecondsToDateAction } from "./milliseconds-to-date-action"

const millisecondsToDate: Tool = {
  id: "milliseconds-to-date",
  title: "Milliseconds To Date",
  action: millisecondsToDateAction,
  inputs: [
    {
      field: "input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      field: "output",
      component: "Textarea"
    }
  ]
}

export default millisecondsToDate
