import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const sortList: AppletConstructor<InputFields, OutputFields> = {
  appletId: "sort-list",
  name: "Sort List",
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
  action: ({ input }) => {
    const lines = input.split("\n").filter((line) => line.trim() !== "")
    lines.sort()
    const sortedString = lines.join("\n")

    return { output: sortedString }
  }
}

export default sortList
