import { Tool } from "src/models/Tool"
import { millisecondsToDateAction } from "./milliseconds-to-date-action"

const millisecondsToDate = new Tool({
  id: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  action: millisecondsToDateAction,
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

export default millisecondsToDate
