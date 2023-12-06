import { Tool } from "../../types/Tool";

const textToUppercase: Tool = {
  id: "text-to-uppercase",
  title: "Text To Uppercase",
  action: ({ input }: { input: String }) => {
    return { output: input.toUpperCase() }
  },
  inputs: [
    {
      field: "input",
      component: "SingleTextareaInput",
      defaultValue: "",
    }
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    }
  ]
}

export default textToUppercase
