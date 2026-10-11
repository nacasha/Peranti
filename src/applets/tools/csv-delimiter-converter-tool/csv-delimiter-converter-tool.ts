import Papa from "papaparse"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  inputDelimiter: InputFieldsType.Switch
  outputDelimiter: InputFieldsType.Switch
  csv: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  quoteAllFields: InputFieldsType.Checkbox
}

const delimiterOptions = [
  { label: "Comma", value: "," },
  { label: "Tab", value: "\t" },
  { label: "Semicolon", value: ";" },
  { label: "Pipe", value: "|" }
]

export const csvDelimiterConverterTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "csv-delimiter-converter",
  fileExtensions: ["csv", "tsv"],
  name: "CSV Delimiter Converter",
  description: "Convert between comma, tab, semicolon and pipe separated values",
  category: "CSV",
  inputFields: [
    {
      key: "inputDelimiter",
      label: "Input Delimiter",
      component: "Switch",
      defaultValue: "",
      skipValidateHasValue: true,
      props: {
        options: [
          { label: "Auto", value: "" },
          ...delimiterOptions
        ]
      }
    },
    {
      key: "outputDelimiter",
      label: "Output Delimiter",
      component: "Switch",
      defaultValue: "\t",
      skipValidateHasValue: true,
      props: {
        options: delimiterOptions
      }
    },
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
      key: "quoteAllFields",
      label: "Quote All Fields",
      component: "Checkbox",
      defaultValue: false
    }
  ],
  samples: [
    {
      name: "Customer Book",
      inputValues: {
        csv: "id,name,email,city\n1,Alice,alice@example.com,Jakarta\n2,\"Bob, Jr.\",bob@example.com,Bandung"
      }
    }
  ],
  action: async({ inputValues, options }) => {
    const { csv, inputDelimiter, outputDelimiter } = inputValues
    const { quoteAllFields } = options

    if (csv.trim().length === 0) {
      return { output: "" }
    }

    const { data: rows } = Papa.parse<string[]>(csv, { delimiter: inputDelimiter, skipEmptyLines: true })

    return { output: Papa.unparse(rows, { delimiter: outputDelimiter, quotes: quoteAllFields }) }
  }
})
