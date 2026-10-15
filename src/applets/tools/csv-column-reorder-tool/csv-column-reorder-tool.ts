import Papa from "papaparse"

import { parseOrder, reconcileOrder } from "src/components/inputs/ListReorderInput"
import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { getCsvColumnLabels } from "src/utils/data/get-csv-column-labels.ts"
import { parseCsvRows } from "src/utils/data/parse-csv-rows.ts"

interface InputFields {
  csv: InputFieldsType.Code
  order: InputFieldsType.ListReorder
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const csvColumnReorderTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "csv-column-reorder",
  fileExtensions: ["csv"],
  name: "CSV Column Reorder",
  description: "Drag the columns of a CSV into a new order",
  category: "CSV",
  inputFields: [
    {
      key: "csv",
      label: "CSV",
      component: "Code",
      defaultValue: "",
      props: {}
    },
    {
      key: "order",
      label: "Column Order",
      component: "ListReorder",
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
  presets: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,email,city\n1,Alice,alice@example.com,Jakarta\n2,Bob,bob@example.com,Bandung"
      }
    }
  ],
  action: async({ inputValues }) => {
    const { csv, order } = inputValues

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { rows, delimiter, columnCount } = parseCsvRows(csv)
    const columnOrder = reconcileOrder(parseOrder(order), columnCount)

    const reordered = rows.map((row) => columnOrder.map((index) => row[index] ?? ""))

    return { output: Papa.unparse(reordered, { delimiter }) }
  }
})
