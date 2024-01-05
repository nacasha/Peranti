import { Tool } from "src/models/Tool"

import { jsonFormatterAction } from "./json-formatter-action.js"

const jsonFormatter = new Tool({
  toolId: "json-formatter",
  name: "JSON Formatter",
  category: "JSON",
  action: jsonFormatterAction,
  layout: "side-by-side",
  inputs: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "pretty",
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
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ]
})

export default jsonFormatter
