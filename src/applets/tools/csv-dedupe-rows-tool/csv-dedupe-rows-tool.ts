import Papa from "papaparse"

import { parseOrder } from "src/components/inputs/ListReorderInput"
import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { getCsvColumnLabels } from "src/utils/data/get-csv-column-labels.ts"
import { parseCsvRows } from "src/utils/data/parse-csv-rows.ts"

interface InputFields {
  csv: InputFieldsType.Code
  excludedKeyColumns: InputFieldsType.ListPick
  ignoreCase: InputFieldsType.Checkbox
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  hasHeader: InputFieldsType.Checkbox
}

export const csvDedupeRowsTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "csv-dedupe-rows",
  fileExtensions: ["csv", "tsv"],
  name: "CSV Remove Duplicate Rows",
  description: "Remove duplicate rows from a CSV, compared by the ticked key columns",
  category: "CSV",
  inputFields: [
    {
      key: "csv",
      label: "CSV",
      component: "Code",
      defaultValue: ""
    },
    {
      key: "excludedKeyColumns",
      label: "Key Columns",
      component: "ListPick",
      defaultValue: "",
      props: {
        selection: "exclude"
      },
      skipValidateHasValue: true,
      computedProps: {
        items: {
          type: "input",
          key: "csv",
          transform: getCsvColumnLabels
        }
      }
    },
    {
      key: "ignoreCase",
      label: "Ignore Case",
      component: "Checkbox",
      defaultValue: false,
      skipValidateHasValue: true
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
      key: "hasHeader",
      label: "First Row Is Header",
      component: "Checkbox",
      defaultValue: true
    }
  ],
  samples: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com\n3,Alice,ALICE@example.com\n2,Bob,bob@example.com"
      }
    }
  ],
  action: async({ inputValues, options }) => {
    const { csv, excludedKeyColumns, ignoreCase } = inputValues
    const { hasHeader } = options

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { rows, delimiter, columnCount } = parseCsvRows(csv)
    const header = hasHeader ? rows.slice(0, 1) : []
    const body = hasHeader ? rows.slice(1) : rows

    // With every column unticked there is nothing to compare by, so fall back to the whole row
    const allColumns = Array.from({ length: columnCount }, (_, index) => index)
    const excludedColumns = new Set(parseOrder(excludedKeyColumns))
    const tickedColumns = allColumns.filter((index) => !excludedColumns.has(index))
    const keyColumns = tickedColumns.length > 0 ? tickedColumns : allColumns

    const seen = new Set<string>()
    const unique = body.filter((row) => {
      const values = keyColumns.map((index) => row[index] ?? "")
      const key = JSON.stringify(ignoreCase ? values.map((value) => value.toLowerCase()) : values)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    return { output: Papa.unparse([...header, ...unique], { delimiter }) }
  }
})
