import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
  type: string
}

interface OutputFields {
  output: unknown
}

const textTransformTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "text-transform",
  name: "Text Transform",
  category: "Text",
  layout: ToolLayoutEnum.TopBottom,
  inputFields: [
    {
      key: "type",
      label: "Type",
      component: "Switch",
      defaultValue: "original",
      props: {
        options: [
          { value: "original", label: "Original Text" },
          { value: "lowercase", label: "lowercase" },
          { value: "uppercase", label: "UPPERCASE" },
          { value: "titlecase", label: "Title Case" },
          { value: "sentencecase", label: "Sentence case" },
          { value: "camelcase", label: "camelCase" },
          { value: "snakecase", label: "snake_case" },
          { value: "kebabcase", label: "kebab-case" }
        ]
      }
    },
    {
      key: "input",
      label: "Input",
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
  action({ input, type }) {
    let output = input
    switch (type.toLowerCase()) {
      case "lowercase":
        output = input.toLowerCase()
        break
      case "uppercase":
        output = input.toUpperCase()
        break
      case "titlecase":
        output = input.replace(/\b\w/g, match => match.toUpperCase())
        break
      case "camelcase":
        output = input.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "")
        break
      case "pascalcase":
        output = input.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^\w/, c => c.toUpperCase())
        break
      case "snakecase":
        output = input.replace(/\s/g, "_").toLowerCase()
        break
      case "kebabcase":
        output = input.replace(/\s/g, "-").toLowerCase()
        break
      case "sentencecase":
        output = input.toLowerCase().replace(/(^\w|\.\s*\w)/g, match => match.toUpperCase())
        break
      case "startcase":
        output = input.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
        break
      case "togglecase":
        output = input.split("").map(char => (char === char.toLowerCase()) ? char.toUpperCase() : char.toLowerCase()).join("")
        break
      case "invertedcase":
        output = input.split("").map(char => (char === char.toLowerCase()) ? char.toUpperCase() : char.toLowerCase()).join("")
        break
      case "randomcase":
        output = input.split("").map(char => (Math.random() < 0.5) ? char.toUpperCase() : char.toLowerCase()).join("")
        break
    }

    return { output }
  }
}

export default textTransformTool
