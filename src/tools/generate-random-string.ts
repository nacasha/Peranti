import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { generateRandomString } from "src/utils/generateRandomString"

interface InputFields {
  count: number
  stringLength: number
  smallAz: boolean
  capitalAz: boolean
  number: boolean
  symbol: boolean
  runner: unknown
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const generateRandomStringTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "generate-random-string",
  name: "Generate Random String",
  category: "Generator",
  inputFields: [
    {
      key: "count",
      label: "Number of Generated String",
      component: "Text",
      defaultValue: 5
    },
    {
      key: "stringLength",
      label: "String Length",
      component: "Text",
      defaultValue: 25
    },
    {
      key: "smallAz",
      label: "Include Lowercase Characters (a-z)",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "capitalAz",
      label: "Include Uppercase Characters (A-Z)",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "number",
      label: "Include Numbers (0-9)",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "symbol",
      label: "Include Special Characters (!@#$%^&*)",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "runner",
      label: "Regenerate",
      component: "Button",
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
  action: ({ count, stringLength, smallAz, capitalAz, number, symbol }: InputFields) => {
    let characters = ""
    if (smallAz) characters = characters.concat("abcdefghijklmnopqrstuvwxyz")
    if (capitalAz) characters = characters.concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if (number) characters = characters.concat("0123456789")
    if (symbol) characters = characters.concat("!@#$%^&*")

    const outputLines = []

    for (let i = 0; i < count; i++) {
      outputLines.push(generateRandomString(stringLength, characters))
    }

    return { output: outputLines.join("\n") }
  }
}

export default generateRandomStringTool
