import { Tool } from "../../types/Tool";
import { millisecondsToDateAction } from "./milliseconds-to-date-action";

const millisecondsToDate: Tool = {
  id: "milliseconds-to-date",
  title: "Milliseconds To Date",
  action: millisecondsToDateAction,
  inputs: [
    {
      field: "input",
      component: "SingleTextareaInput",
      defaultValue: "",
    },
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    }
  ]
}

export default millisecondsToDate
