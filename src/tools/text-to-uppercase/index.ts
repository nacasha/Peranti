import { Tool } from "../../types/Tool";

const textToUppercase: Tool = {
  id: "text-to-uppercase",
  title: "Text To Uppercase",
  category: "Text",
  action: ({ input }: { input: String }) => {
    return { output: input.toUpperCase() }
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

export default textToUppercase
