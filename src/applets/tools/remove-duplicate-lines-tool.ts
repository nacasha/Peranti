import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const removeDuplicateList = new AppletConstructor<InputFields, OutputFields>({
  appletId: "remove-duplicate-list",
  name: "Remove Duplicate List",
  category: "List",
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  action: ({ inputValues }) => {
    const { input } = inputValues

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
