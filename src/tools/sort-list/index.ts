import { Tool } from "src/models/Tool"

const sortList = new Tool({
  toolId: "sort-list",
  name: "Sort List",
  category: "List",
  inputs: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action: ({ input }: { input: string }) => {
    const lines = input.split("\n").filter((line) => line.trim() !== "")
    lines.sort()
    const sortedString = lines.join("\n")

    return { output: sortedString }
  }
})

export default sortList
