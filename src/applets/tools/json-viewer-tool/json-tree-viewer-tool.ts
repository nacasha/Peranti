import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

import customerBook from "./customer-book-sample.json"

interface InputFields {
  json: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.JsonTree
}

export const jsonTreeViewerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "json-tree-viewer",
  fileExtensions: ["json"],
  name: "JSON Tree Viewer",
  description: "Explore nested JSON as a collapsible tree, filter it and copy paths",
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
      key: "output",
      label: "Tree",
      component: "JsonTree"
    }
  ],
  presets: [
    {
      name: "Customer Book",
      inputValues: {
        json: JSON.stringify(customerBook, null, 2)
      }
    }
  ],
  action: async({ inputValues }) => {
    const { json } = inputValues

    return {
      output: json
    }
  }
})
