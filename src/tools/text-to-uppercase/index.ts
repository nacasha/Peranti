import { type Tool } from "src/types/Tool"

const textToUppercase: Tool = {
  id: "text-to-uppercase",
  title: "Text To Uppercase",
  category: "Text",
  action: ({ input }: { input: string }) => {
    return { output: input.toUpperCase() }
  },
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

export default textToUppercase
