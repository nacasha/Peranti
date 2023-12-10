import { Tool } from "src/models/Tool"

const prefixSuffixLines = new Tool({
  toolId: "prefix-suffix-lines",
  name: "Prefix Suffix Lines",
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
      key: "prefix",
      component: "Text",
      defaultValue: "",
      props: {
        label: "Prefix"
      }
    },
    {
      key: "suffix",
      component: "Text",
      defaultValue: "",
      props: {
        label: "Suffix"
      }
    },
    {
      key: "input",
      component: "Textarea",
      defaultValue: "",
      props: {
        label: "Text Lines"
      }
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default prefixSuffixLines
