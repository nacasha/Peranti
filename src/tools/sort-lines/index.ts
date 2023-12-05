import { Tool } from "../../types/Tool";

const sortLines: Tool = {
  title: "Sort Lines",
  action: ({ input }: { input: String }) => {
    const lines = input.split('\n').filter((line) => line.trim() !== "");
    lines.sort();
    const sortedString = lines.join('\n');

    return { output: sortedString }
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

export default sortLines
