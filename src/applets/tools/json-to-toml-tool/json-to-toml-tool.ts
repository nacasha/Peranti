import toml from "@iarna/toml"

import { AppletConstructor } from "src/models/AppletConstructor"

export const jsonToTomlTool = new AppletConstructor({
  appletId: "json-to-toml",
  name: "JSON to TOML",
  description: "JSON to TOML Converter",
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
      key: "toml",
      label: "YAML",
      component: "Code",
      props: {
        language: "yaml"
      }
    }
  ],
  action: async(actionParams) => {
    const { inputValues } = actionParams
    const { json } = inputValues

    if (json.trim().length === 0) {
      return { toml: "" }
    }

    const data = toml.stringify(JSON.parse(json))
    return { toml: data }
  }
})
