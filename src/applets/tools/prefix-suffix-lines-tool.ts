import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  prefix: InputFieldsType.Text
  suffix: InputFieldsType.Text
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const prefixSuffixLines: AppletConstructor<InputFields, OutputFields> = {
  appletId: "prefix-suffix-lines",
  name: "Prefix Suffix Lines",
  category: "List",
  inputFields: [
    {
      key: "prefix",
      label: "Prefix",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "suffix",
      label: "Suffix",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "input",
      label: "Text Lines",
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
  action: ({ input, prefix, suffix }: { prefix: string, suffix: string, input: string }) => {
    const lines = input.split("\n")
      .filter((text) => text.trim() !== "")
      .map((text) => prefix.trim().concat(text.trim().concat(suffix.trim())))
    const resultString = Array.from(lines).join("\n")

    return { output: resultString }
  }
}

export default prefixSuffixLines