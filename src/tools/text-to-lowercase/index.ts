import { Tool } from "../../types/Tool";

const textToLowercase: Tool = {
  id: "text-to-lowercase",
  title: "Text To Lowercase",
  category: "Text",
  action: ({ input }: { input: String }) => {
    return { output: input.toLowerCase() }
  },
  inputs: [
    {
      field: "input",
      component: "Textarea",
      defaultValue: "",
    }
  ],
  outputs: [
    {
      field: "output",
      component: "Textarea",
    }
  ]
}

export default textToLowercase
