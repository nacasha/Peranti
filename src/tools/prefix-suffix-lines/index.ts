import { type Tool } from "src/types/Tool"

const prefixSuffixLines: Tool = {
  id: "prefix-suffix-lines",
  title: "Prefix Suffix Lines",
  category: "Text",
  action: ({ input, prefix, suffix }: { prefix: string, suffix: string, input: string }) => {
    const lines = input.split("\n")
      .filter((text) => text.trim() !== "")
      .map((text) => prefix.trim().concat(text.trim().concat(suffix.trim())))
    const resultString = Array.from(lines).join("\n")

    return { output: resultString }
  },
  inputs: [
    {
      field: "prefix",
      component: "Text",
      defaultValue: "",
      props: {
        label: "Prefix"
      }
    },
    {
      field: "suffix",
      component: "Text",
      defaultValue: "",
      props: {
        label: "Suffix"
      }
    },
    {
      field: "input",
      component: "Textarea",
      defaultValue: "",
      props: {
        label: "Text Lines"
      }
    }
  ],
  outputs: [
    {
      field: "output",
      component: "Textarea"
    }
  ]
}

export default prefixSuffixLines
