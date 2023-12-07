import { Tool } from "src/models/Tool"

const textToUppercase = new Tool({
  id: "text-to-uppercase",
  title: "Text To Uppercase",
  category: "Text",
  action: ({ input }: { input: string }) => {
    return { output: input.toUpperCase() }
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

export default textToUppercase
