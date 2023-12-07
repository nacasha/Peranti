import { type Tool } from "src/types/Tool"

const textToLowercase: Tool = {
  id: "text-to-lowercase",
  title: "Text To Lowercase",
  category: "Text",
  action: ({ input }: { input: string }) => {
    return { output: input.toLowerCase() }
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

export default textToLowercase
