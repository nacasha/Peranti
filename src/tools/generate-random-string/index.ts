import { Tool } from "src/models/Tool"
import { generateRandomString } from "src/utils/generateRandomString"

interface InputParams {
  stringLength: number
  smallAz: boolean
  capitalAz: boolean
  number: boolean
  symbol: boolean
}

const generateRandomStringTool = new Tool({
  toolId: "generate-random-string",
  name: "Generate Random String",
  category: "Generator",
  inputs: [
    {
      key: "stringLength",
      label: "String Length",
      component: "Text",
      defaultValue: 25
    },
    {
      key: "smallAz",
      label: "a-z",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "capitalAz",
      label: "A-Z",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "number",
      label: "0-9",
      component: "Checkbox",
      defaultValue: true
    },
    {
      key: "symbol",
      label: "!@#$%^&*",
      component: "Checkbox",
      defaultValue: true
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action: ({ stringLength, smallAz, capitalAz, number, symbol }: InputParams) => {
    let characters = ""
    if (smallAz) characters = characters.concat("abcdefghijklmnopqrstuvwxyz")
    if (capitalAz) characters = characters.concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if (number) characters = characters.concat("0123456789")
    if (symbol) characters = characters.concat("!@#$%^&*")

    const output = generateRandomString(stringLength, characters)

    return { output }
  }
})

export default generateRandomStringTool
