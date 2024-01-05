import { Tool } from "src/models/Tool"
import { cronReadableAction } from "src/tools/cron-readable/cron-readable.ts"

const cronReadableTool = new Tool({
  toolId: "cron-readable",
  name: "CRON Readable",
  category: "List",
  layout: "side-by-side",
  action: cronReadableAction,
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

export default cronReadableTool
