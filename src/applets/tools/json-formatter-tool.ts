import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Switch
  space: InputFieldsType.Text
  type: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  indentType: InputFieldsType.Select
  indentSize: InputFieldsType.Select
}

const jsonFormatter: AppletConstructor<InputFields, OutputFields, Options> = {
  appletId: "json-formatter",
  name: "JSON Formatter",
  description: "JSON Format/Minify/Pretty/Beautify",
  category: "JSON",
  inputFields: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "pretty",
      skipValidateHasValue: true,
      props: {
        options: [
          { value: "minify", label: "Minify" },
          { value: "pretty", label: "Pretty" }
        ]
      }
    },
    {
      key: "input",
      label: "Input",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json",
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  options: [
    {
      key: "indentType",
      label: "Pretty Indentation",
      component: "Select",
      defaultValue: "space",
      props: {
        options: [
          { label: "Tab", value: "tab" },
          { label: "Space", value: "space" }
        ]
      }
    },
    {
      key: "indentSize",
      label: "Indent Size",
      component: "Select",
      defaultValue: "2",
      props: {
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "6", value: "6" },
          { label: "7", value: "7" },
          { label: "8", value: "8" }
        ]
      }
    }
  ],
  action: ({ inputValues, options }) => {
    const { input, type } = inputValues
    const { indentType, indentSize } = options

    if (input.trim().length === 0) {
      return { output: "" }
    }

    const isPretty = type === "pretty"
    const indentTab = indentType === "tab"
    const indentTabSize = new Array(Number(indentSize)).fill("\t").join("")

    try {
      const jsonObj = JSON.parse(input)
      if (isPretty) {
        const output = JSON.stringify(jsonObj, null, indentTab ? indentTabSize : Number(indentSize))
        return { output }
      }

      const output = JSON.stringify(jsonObj)
      return { output }
    } catch (error) {
      if (error instanceof Error) {
        const output = `Error formatting JSON: ${error.message}`
        return { output }
      } else {
        return { output: "Unknown Error" }
      }
    }
  }
}

export default jsonFormatter
