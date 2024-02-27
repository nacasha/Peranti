import unescapejs from "unescape-js"

import { AppletConstructorModel } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  type: InputFieldsType.Switch
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const textEscapeUnescapeTool = new AppletConstructorModel<InputFields, OutputFields>({
  appletId: "text-escape-unescape-tool",
  name: "Text Escape / Unescape",
  category: "Text",
  inputFields: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "escape",
      skipValidateHasValue: true,
      props: {
        options: [
          { value: "escape", label: "Escape" },
          { value: "unescape", label: "Unescape" }
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
    if (type === "escape") {
      return { output: JSON.stringify(input).slice(1, -1) }
    }
    return { output: unescapejs(input) }
  }
})

export default textEscapeUnescapeTool
