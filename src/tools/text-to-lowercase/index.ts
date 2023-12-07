import { Tool } from "src/models/Tool"

const textToLowercase = new Tool({
  id: "text-to-lowercase",
  name: "Text To Lowercase",
  category: "Text",
  action: ({ input }: { input: string }) => {
    return { output: input.toLowerCase() }
  },
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

export default textToLowercase
