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
  inputFields: (inputParams) => {
    const additionalInput = {
      key: "space",
      label: "Spaces",
      component: "Text",
      defaultValue: "2",
      skipValidateHasValue: true
    } as any

    return [
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
      ...(inputParams.type === "pretty" ? [additionalInput] : []),
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
    ]
  },
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
      label: "Indentation",
      type: "Select"
    },
    {
      key: "size",
      label: "Size",
      type: "Text"
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
