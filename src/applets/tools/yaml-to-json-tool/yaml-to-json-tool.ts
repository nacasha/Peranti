import jsYaml from "js-yaml"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  yaml: InputFieldsType.Code
}

interface OutputFields {
  json: OutputFieldsType.Code
}

export const yamlToJsonTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "yaml-to-json",
  name: "YAML to JSON",
  description: "YAML to JSON Converter",
  category: "YAML",
  inputFields: [
    {
      key: "yaml",
      label: "YAML",
      component: "Code",
      defaultValue: "",
      props: {
        language: "yaml"
      }
    }
  ],
  outputFields: [
    {
      key: "json",
      label: "JSON",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  action: async({ inputValues }) => {
    const { yaml } = inputValues

    if (yaml.trim().length === 0) {
      return { json: "" }
    }

    const data = jsYaml.load(yaml)

    return { json: JSON.stringify(data, null, 2) }
  }
})
