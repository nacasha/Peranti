import { Tool } from "src/models/Tool"

const sortList = new Tool({
  id: "sort-list",
  title: "Sort List",
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
