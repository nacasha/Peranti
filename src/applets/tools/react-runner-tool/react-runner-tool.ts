import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  code: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.React
}

export const reactRunnerTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "react-runner",
  name: "React Runner",
  description: "Run your React code on the go",
  category: "React",
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
      component: "React"
    }
  ],
  action: async({ inputValues }) => {
    const { code } = inputValues

    return { output: code }
  }
}
