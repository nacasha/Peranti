import jsonata from "jsonata"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

import addressSample from "./address-sample.json"
import invoiceSample from "./invoice-sample.json"
import librarySample from "./library-sample.json"
import schemaSample from "./schema-sample.json"

interface InputFields {
  jsonString: InputFieldsType.Code
  expression: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const jsonataTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "jsonata",
  name: "JSONata",
  description: "JSON query and transformation language",
  category: "JSON",
  inputFields: [
    {
      key: "expression",
      label: "JSONata Expression",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    },
    {
      key: "jsonString",
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
      label: "Result",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  samples: [
    {
      name: "Invoice",
      inputValues: {
        expression: "$sum(Account.Order.Product.(Price * Quantity))",
        jsonString: JSON.stringify(invoiceSample, null, 2)
      }
    },
    {
      name: "Address",
      inputValues: {
        expression: `{
  "name": FirstName & " " & Surname,
  "mobile": Phone[type = "mobile"].number
}`,
        jsonString: JSON.stringify(addressSample, null, 2)
      }
    },
    {
      name: "Library",
      inputValues: {
        expression: `library.loans@$L.books@$B[$L.isbn=$B.isbn].customers[$L.customer=id].{
  'customer': name,
  'book': $B.title,
  'due': $L.return
}`,
        jsonString: JSON.stringify(librarySample, null, 2)
      }
    },
    {
      name: "Schema",
      inputValues: {
        expression: "**.properties ~> $keys()",
        jsonString: JSON.stringify(schemaSample, null, 2)
      }
    }
  ],
  action: async({ inputValues }) => {
    const { jsonString, expression } = inputValues

    if (jsonString.trim().length === 0 || expression.trim().length === 0) {
      return { output: "" }
    }

    try {
      const jsonData = JSON.parse(jsonString)
      const jsonataExpression = jsonata(expression)
      const output = await jsonataExpression.evaluate(jsonData)

      return { output }
    } catch (e: any) {
      if (e?.message) {
        return { output: e?.message }
      }

      return { output: "Error" }
    }
  }
}
