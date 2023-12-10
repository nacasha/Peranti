import { Tool } from "src/models/Tool"
import { jsonFormatterAction } from "./json-formatter-action"

const jsonFormatter = new Tool({
  toolId: "json-formatter",
  name: "JSON Formatter",
  category: "JSON",
  action: jsonFormatterAction,
  layout: "side-by-side",
  inputs: [
    {
      key: "type",
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
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default jsonFormatter
