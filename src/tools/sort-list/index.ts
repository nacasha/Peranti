import { Tool } from "../../types/Tool";

const sortList: Tool = {
  id: "sort-list",
  title: "Sort List",
  category: "List",
  action: ({ input }: { input: String }) => {
    const lines = input.split('\n').filter((line) => line.trim() !== "");
    lines.sort();
    const sortedString = lines.join('\n');

    return { output: sortedString }
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

export default sortList
