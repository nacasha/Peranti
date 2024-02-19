import { createInitminalRun } from "@initminal/run"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  code: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

export const javascriptRunnerTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "javascript-runner",
  name: "Javascript Runner",
  description: "Safely execute untrusted code with ESM syntax support, dynamic injection of ESM modules from URL or plain JS code, and granular access control based on whitelisting for each JS object.",
  category: "Javascript",
  inputFields: [
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
  action: async({ inputValues }) => {
    const { code } = inputValues

    try {
      const InitminalRun = createInitminalRun()
      const result = await InitminalRun.run(code)

      if (result.success) {
        return { output: result.value as string }
      } else {
        console.log(result.error)
        return { output: "Error" }
      }
    } catch (exception) {
      console.log(exception)
      return { output: "" }
    }
  }
}
