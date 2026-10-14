import { csv2json } from "json-2-csv"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  csv: InputFieldsType.Code
}

interface OutputFields {
  json: OutputFieldsType.Code
}

interface Options {
  delimiter: InputFieldsType.Text
  trimFieldValues: InputFieldsType.Checkbox
  trimHeaderFields: InputFieldsType.Checkbox
}

export const csvToJsonTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "csv-to-json",
  fileExtensions: ["csv"],
  name: "CSV to JSON",
  description: "CSV to JSON Converter",
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
      key: "json",
      label: "JSON",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  options: [
    {
      key: "delimiter",
      label: "Delimiter",
      component: "Text",
      defaultValue: ","
    },
    {
      key: "trimFieldValues",
      component: "Checkbox",
      defaultValue: false,
      label: "Trim Field Values"
    },
    {
      key: "trimHeaderFields",
      component: "Checkbox",
      defaultValue: false,
      label: "Trim Header Fields"
    }
  ],
  samples: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,email,address.city\n1,Alice,alice@example.com,Jakarta\n2,Bob,bob@example.com,Bandung"
      }
    }
  ],
  action: async({ inputValues, options }) => {
    const { csv } = inputValues
    const { delimiter, ...restOptions } = options

    if (csv.trim().length === 0) {
      return { json: "" }
    }

    const data = csv2json(csv, {
      delimiter: {
        field: delimiter
      },
      ...restOptions
    })

    return { json: JSON.stringify(data, null, 2) }
  }
})
