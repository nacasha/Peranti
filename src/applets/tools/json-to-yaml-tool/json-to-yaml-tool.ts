import jsYaml from "js-yaml"

import { AppletConstructor } from "src/models/AppletConstructor"

export const jsonToYamlTool = new AppletConstructor({
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
      component: "Code",
      props: {
        language: "yaml"
      }
    }
  ],
  options: [
    {
      key: "forceQuotes",
      label: "Always Quote",
      component: "Checkbox",
      defaultValue: false
    },
    {
      key: "noArrayIndent",
      label: "No Array Indent",
      component: "Checkbox",
      defaultValue: false
    },
    {
      key: "quotingType",
      label: "Quote Type",
      component: "Select",
      defaultValue: "'",
      props: {
        options: [
          { label: "Single Quote", value: "'" },
          { label: "Double Quotes", value: "\"" }
        ]
      }
    },
    {
      key: "indent",
      label: "Indent",
      component: "Text",
      defaultValue: "2"
    }
  ],
  action: async({ inputValues, options }) => {
    const { json } = inputValues
    const { forceQuotes, indent, noArrayIndent, quotingType } = options

    if (json.trim().length === 0) {
      return { yaml: "" }
    }

    const data = jsYaml.dump(JSON.parse(json), {
      skipInvalid: true,
      forceQuotes: Boolean(forceQuotes),
      indent: Number(indent),
      quotingType,
      noArrayIndent: Boolean(noArrayIndent)
    })

    return { yaml: data }
  }
})
