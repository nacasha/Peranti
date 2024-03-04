import Papa from "papaparse"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  csvString: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.DataGrid
}

export const csvTableViewerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "csv-table-viewer",
  name: "CSV Viewer",
  description: "View CSV data format in pretty spreadsheet view",
  category: "CSV",
  inputFields: [
    {
      key: "csvString",
      label: "CSV String",
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
  samples: [
    {
      name: "Sample 1",
      inputValues: {
        csvString: `Joe Doe,Structure and Interpretation of Computer Programs,2016-12-05
Jason Arthur,"Compilers: Principles, Techniques, and Tools",2016-10-22
Jason Arthur,Structure and Interpretation of Computer Programs,2016-12-22`
      }
    }
  ],
  action: async({ inputValues }) => {
    const { csvString } = inputValues
    let data: any[] = []

    try {
      data = Papa.parse(csvString).data
      console.log({ data })
    } catch (error) {
      console.log(error)
    }

    return { output: JSON.stringify(data) }
  }
})
