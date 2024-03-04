import { json2csv } from "json-2-csv"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

import customerBook from "./customer-book-sample.json"

interface InputFields {
  json: InputFieldsType.Code
}

interface OutputFields {
  csv: OutputFieldsType.Code
}

interface Options {
  delimiter: InputFieldsType.Text
  sortHeader: InputFieldsType.Checkbox
  trimFieldValues: InputFieldsType.Checkbox
  trimHeaderFields: InputFieldsType.Checkbox
  checkSchemaDifferences: InputFieldsType.Checkbox
  expandNestedObjects: InputFieldsType.Checkbox
  expandArrayObjects: InputFieldsType.Checkbox
  prependHeader: InputFieldsType.Checkbox
}

export const jsonToCsvTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "json-to-csv",
  name: "JSON to CSV",
  description: "JSON to CSV Converter",
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
      key: "csv",
      label: "CSV",
      component: "Code"
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
      key: "sortHeader",
      component: "Checkbox",
      defaultValue: false,
      label: "Sort Header"
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
    },
    {
      key: "checkSchemaDifferences",
      component: "Checkbox",
      defaultValue: false,
      label: "Check Schema Differences"
    },
    {
      key: "expandNestedObjects",
      component: "Checkbox",
      defaultValue: true,
      label: "Expand Nested Objects"
    },
    {
      key: "expandArrayObjects",
      component: "Checkbox",
      defaultValue: false,
      label: "Expand Array Objects"
    },
    {
      key: "prependHeader",
      component: "Checkbox",
      defaultValue: true,
      label: "Prepend Header"
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
  action: async({ inputValues, options }) => {
    const { json } = inputValues
    const { delimiter, ...restOptions } = options

    if (json.trim().length === 0) {
      return { csv: "" }
    }

    console.log(options)

    const csv = json2csv(JSON.parse(json), {
      delimiter: {
        field: delimiter
      },
      ...restOptions
    })
    return { csv }
  }
})
