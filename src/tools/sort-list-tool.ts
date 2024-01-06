import { Tool } from "src/models/Tool"

interface InputFields {
  input: string
}

interface OutputFields {
  output: unknown
}

const sortList = new Tool<InputFields, OutputFields>({
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
  action: ({ input }) => {
    const lines = input.split("\n").filter((line) => line.trim() !== "")
    lines.sort()
    const sortedString = lines.join("\n")

    return { output: sortedString }
  }
})

export default sortList
