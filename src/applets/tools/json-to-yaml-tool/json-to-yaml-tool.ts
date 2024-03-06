import YAML from "yamljs"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  json: InputFieldsType.Code
}

interface OutputFields {
  yaml: OutputFieldsType.Code
}

export const jsonToYamlTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "json-to-yaml",
  name: "JSON to YAML",
  description: "JSON to YAML Converter",
  category: "JSON",
  inputFields: [
    {
      key: "json",
      label: "JSON",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    }
  ],
  outputFields: [
    {
      key: "yaml",
      label: "YAML",
      component: "Code"
    }
  ],
  action: async({ inputValues }) => {
    const { json } = inputValues

    if (json.trim().length === 0) {
      return { yaml: "" }
    }

    const data = YAML.stringify(JSON.parse(json), 100, 10)

    return { yaml: data }
  }
})
