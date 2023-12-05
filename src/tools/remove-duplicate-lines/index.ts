import { Tool } from "../../types/Tool";

const removeDuplicateLines: Tool = {
  title: "Remove Duplicate Lines",
  action: ({ input }: { input: String }) => {
    // Split the input string into an array of lines
    const lines = input.split('\n');

    // Use a Set to keep track of unique lines
    const uniqueLines = new Set(lines);

    // Convert the Set back to an array and join the lines
    const resultString = Array.from(uniqueLines).join('\n');

    return { output: resultString }
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

export default removeDuplicateLines
