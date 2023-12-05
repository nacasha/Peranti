import { Tool } from "../../types/Tool";

const textToUppercase: Tool = {
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
