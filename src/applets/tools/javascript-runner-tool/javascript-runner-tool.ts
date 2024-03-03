import { createInitminalRun, defaultSafeObjects } from "@initminal/run"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

import { diamondFunctionSample } from "./diamond-function-sample.js"
import { fibonacciFunctionSample } from "./fibbonaci-function-sample.js"
import { primeNumberSample } from "./prime-number-sample.js"

interface InputFields {
  input: InputFieldsType.Text
  code: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const javascriptRunnerTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "javascript-runner",
  name: "Javascript Runner",
  description: "Safely execute untrusted code with ESM syntax support, dynamic injection of ESM modules from URL or plain JS code, and granular access control based on whitelisting for each JS object.",
  category: "Javascript",
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "code",
      label: "Code",
      component: "Code",
      defaultValue: "",
      props: {
        language: "javascript"
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
      name: "Prime Number",
      inputValues: {
        code: primeNumberSample,
        input: "169889"
      }
    },
    {
      name: "Fibbonaci",
      inputValues: {
        code: fibonacciFunctionSample,
        input: "10"
      }
    },
    {
      name: "Diamond",
      inputValues: {
        code: diamondFunctionSample,
        input: "27"
      }
    }
  ],
  action: async({ inputValues }) => {
    let { code, ...restInputs } = inputValues
    code = code.replace("export default", "export const OUTPUT = ")

    try {
      const InitminalRun = createInitminalRun({
        whitelists: [
          ...defaultSafeObjects,
          "crypto",
          "FormData",
          "URLSearchParams",
          "navigator",
          "WorkerGlobalScope",
          "importScripts",
          "XMLHttpRequest",
          "awaiuuidv4"
        ]
      })

      const result = await InitminalRun.run(code, {}, restInputs, "OUTPUT")

      if (result.success) {
        return { output: result.value as string }
      } else {
        console.log(result.error)
        return { output: JSON.stringify(result.error) }
      }
    } catch (exception) {
      console.log(exception)
      return { output: "" }
    }
  }
})
