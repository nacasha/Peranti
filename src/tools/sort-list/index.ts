import { Tool } from "src/models/Tool"

const sortList = new Tool({
  toolId: "sort-list",
  name: "Sort List",
  category: "List",
  action: ({ input }: { input: string }) => {
    const lines = input.split("\n").filter((line) => line.trim() !== "")
    lines.sort()
    const sortedString = lines.join("\n")

    return { output: sortedString }
  },
  inputs: [
    {
      key: "input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default sortList
