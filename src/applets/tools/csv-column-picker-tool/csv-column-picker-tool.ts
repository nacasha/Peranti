import Papa from "papaparse"

import { parseOrder } from "src/components/inputs/ListReorderInput"
import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { getCsvColumnLabels } from "src/utils/get-csv-column-labels.ts"
import { parseCsvRows } from "src/utils/parse-csv-rows.ts"

interface InputFields {
  csv: InputFieldsType.Code
  excluded: InputFieldsType.ListPick
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const csvColumnPickerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "csv-column-picker",
  fileExtensions: ["csv"],
  name: "CSV Column Picker",
  description: "Pick which columns of a CSV to keep",
  category: "CSV",
  inputFields: [
    {
      key: "csv",
      label: "CSV",
      component: "Code",
      defaultValue: ""
    },
    {
      key: "excluded",
      label: "Columns",
      component: "ListPick",
      defaultValue: "",
      computedProps: {
        items: {
          type: "input",
          key: "csv",
          transform: getCsvColumnLabels
        }
      }
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
    const { csv, excluded } = inputValues

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { rows, delimiter, columnCount } = parseCsvRows(csv)
    const excludedColumns = new Set(parseOrder(excluded))
    const keptColumns = Array.from({ length: columnCount }, (_, index) => index)
      .filter((index) => !excludedColumns.has(index))

    const picked = rows.map((row) => keptColumns.map((index) => row[index] ?? ""))

    return { output: Papa.unparse(picked, { delimiter }) }
  }
})
