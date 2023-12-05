import { Tool } from "../../types/Tool";

const textToLowercase: Tool = {
  title: "Text To Lowercase",
  action: ({ input }: { input: String }) => {
    return { output: input.toLowerCase() }
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

export default textToLowercase
