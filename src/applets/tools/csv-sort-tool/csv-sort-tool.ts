import Papa from "papaparse"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { parseCsvRows } from "src/utils/data/parse-csv-rows.ts"
import { resolveCsvColumnIndex } from "src/utils/data/resolve-csv-column-index.ts"

import { compareCsvValues } from "./compare-csv-values.ts"

interface InputFields {
  csv: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  sortColumn: InputFieldsType.Text
  direction: InputFieldsType.Select
  compareAs: InputFieldsType.Select
  hasHeader: InputFieldsType.Checkbox
}

export const csvSortTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "csv-sort",
  fileExtensions: ["csv", "tsv"],
  name: "CSV Sort",
  description: "Sort the rows of a CSV by a column",
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
  options: [
    {
      key: "sortColumn",
      label: "Sort Column (name or position)",
      component: "Text",
      defaultValue: "1"
    },
    {
      key: "direction",
      label: "Direction",
      component: "Select",
      defaultValue: "asc",
      props: {
        options: [
          { label: "Ascending", value: "asc" },
          { label: "Descending", value: "desc" }
        ]
      }
    },
    {
      key: "compareAs",
      label: "Compare As",
      component: "Select",
      defaultValue: "text",
      props: {
        options: [
          { label: "Text", value: "text" },
          { label: "Number", value: "number" }
        ]
      }
    },
    {
      key: "hasHeader",
      label: "First Row Is Header",
      component: "Checkbox",
      defaultValue: true
    }
  ],
  presets: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,age\n1,Charlie,42\n2,alice,9\n3,Bob,105\n4,Dave,"
      }
    }
  ],
  action: async({ inputValues, options }) => {
    const { csv } = inputValues
    const { sortColumn, direction, compareAs, hasHeader } = options

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { rows, delimiter } = parseCsvRows(csv)
    const header = hasHeader ? rows.slice(0, 1) : []
    const body = hasHeader ? rows.slice(1) : rows

    const columnIndex = resolveCsvColumnIndex(header[0] ?? [], sortColumn)
    if (columnIndex === undefined) {
      return { output: `Unknown column "${sortColumn.trim()}"` }
    }

    const sign = direction === "desc" ? -1 : 1
    const sorted = [...body].sort((a, b) => {
      return compareCsvValues(a[columnIndex] ?? "", b[columnIndex] ?? "", compareAs, sign)
    })

    return { output: Papa.unparse([...header, ...sorted], { delimiter }) }
  }
})
