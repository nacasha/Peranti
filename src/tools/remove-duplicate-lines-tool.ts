import { Tool } from "src/models/Tool"

interface InputParams {
  input: string
}

interface OutputFields {
  output: unknown
}

const removeDuplicateList = new Tool<InputParams, OutputFields>({
  toolId: "remove-duplicate-list",
  name: "Remove Duplicate List",
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
  action: (inputParams: InputParams) => {
    const { input } = inputParams

    // Split the input string into an array of lines
    const lines = input.split("\n")

    // Use a Set to keep track of unique lines
    const uniqueLines = new Set(lines)

    // Convert the Set back to an array and join the lines
    const output = Array.from(uniqueLines).join("\n")

    return { output }
  }
})

export default removeDuplicateList
