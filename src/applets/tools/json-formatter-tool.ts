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

const jsonFormatter: AppletConstructor<InputFields, OutputFields> = {
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
      key: "indentation",
      label: "Pretty Indentation",
      component: "Select",
      props: {
        options: [
          { label: "Space", value: "space" },
          { label: "Tab", value: "tab" }
        ]
      }
    },
    {
      key: "size",
      label: "Indent Size",
      component: "Select",
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
  action: (inputParams) => {
    const { input, type } = inputParams
    if (input.trim().length === 0) return { output: "" }

    try {
      const isPretty = type === "pretty"
      const jsonObj = JSON.parse(input)
      const output = JSON.stringify(jsonObj, null, isPretty ? 2 : undefined)
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
