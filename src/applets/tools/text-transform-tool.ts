import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  type: InputFieldsType.Switch
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const textTransformTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "text-transform",
  name: "Text Case Transform",
  category: "Text",
  layoutSetting: {
    direction: "vertical"
  },
  inputFields: [
    {
      key: "type",
      label: "Type",
      component: "Switch",
      defaultValue: "original",
      skipValidateHasValue: true,
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
  action({ inputValues }) {
    const { input, type } = inputValues

    let output: string = input
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
