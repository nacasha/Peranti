import Papa from "papaparse"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  csv: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const csvTransposeTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "csv-transpose",
  fileExtensions: ["csv", "tsv"],
  name: "CSV Transpose",
  description: "Swap the rows and columns of a CSV",
  category: "CSV",
  inputFields: [
    {
      key: "csv",
      label: "CSV",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  samples: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,email,city\n1,Alice,alice@example.com,Jakarta\n2,Bob,bob@example.com,Bandung"
      }
    }
  ],
  action: async({ inputValues }) => {
    const { csv } = inputValues

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { data: rows, meta } = Papa.parse<string[]>(csv, { skipEmptyLines: true })
    const columnCount = Math.max(...rows.map((row) => row.length))

    const transposed = Array.from({ length: columnCount }, (_, column) => rows.map((row) => row[column] ?? ""))

    return { output: Papa.unparse(transposed, { delimiter: meta.delimiter }) }
  }
})
