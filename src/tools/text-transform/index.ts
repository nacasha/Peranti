import { Tool } from "src/models/Tool"

const textTransformTool = new Tool({
  toolId: "text-transform",
  name: "Text Transform",
  category: "Text",
  layout: "top-bottom-auto",
  inputs: [
    {
      key: "type",
      component: "Switch",
      defaultValue: "pretty",
      props: {
        options: [
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
      component: "Text",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ],
  action({ input, type }: { input: string, type: string }) {
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
})

export default textTransformTool
