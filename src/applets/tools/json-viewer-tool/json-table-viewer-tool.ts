import { AppletConstructor } from "src/models/AppletConstructor"
import customerBook from "src/samples/customer-book-sample.json"
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
      defaultValue: "",
      props: {
        language: "json"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "DataGrid"
    }
  ],
  samples: [
    {
      name: "Customer Book",
      inputValues: {
        json: JSON.stringify(customerBook, null, 2)
      }
    }
  ],
  action: async({ inputValues }) => {
    const { json } = inputValues
    return { output: json }
  }
})
