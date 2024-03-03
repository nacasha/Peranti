import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  json: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.DataGrid
}

export const jsonTableViewerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "json-table-viewer",
  name: "JSON Table Viewer",
  description: "View JSON data format in pretty spreadsheet view",
  category: "JSON",
  inputFields: [
    {
      key: "json",
      label: "JSON",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "DataGrid"
    }
  ],
  action: async({ inputValues }) => {
    const { json } = inputValues
    return { output: json }
  }
})
