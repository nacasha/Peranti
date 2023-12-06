import { Tool } from "../../types/Tool";

const prefixSuffixLines: Tool = {
  id: "prefix-suffix-lines",
  title: "Prefix Suffix Lines",
  action: ({ input, prefix, suffix }: { prefix: string, suffix: string, input: string }) => {
    const lines = input.split('\n')
      .filter((text) => text.trim() !== "")
      .map((text) => prefix.trim().concat(text.trim().concat(suffix.trim())));
    const resultString = Array.from(lines).join('\n');

    return { output: resultString }
  },
  inputs: [
    {
      field: "prefix",
      component: "SingleTextInput",
      defaultValue: "",
      props: {
        label: "Prefix"
      }
    },
    {
      field: "suffix",
      component: "SingleTextInput",
      defaultValue: "",
      props: {
        label: "Suffix"
      }
    },
    {
      field: "input",
      component: "SingleTextareaInput",
      defaultValue: "",
      props: {
        label: "Text Lines"
      }
    }
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    },
  ]
}

export default prefixSuffixLines
