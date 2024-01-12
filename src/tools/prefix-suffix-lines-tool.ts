import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  prefix: string
  suffix: string
  input: string
}

interface OutputFields {
  output: unknown
}

const prefixSuffixLines: ToolConstructor<InputFields, OutputFields> = {
  toolId: "prefix-suffix-lines",
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
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
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
