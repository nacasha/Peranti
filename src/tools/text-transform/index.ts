import { Tool } from "src/models/Tool"

const textTransformTool = new Tool({
  id: "text-transform",
  title: "Text Transform",
  category: "Text",
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
  ],
  action({ input }: any) {
    return { output: input }
  }
})

export default textTransformTool
