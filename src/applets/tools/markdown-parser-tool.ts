import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  markdown: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Markdown
}

const markdownParserTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "markdown-editor",
  name: "Markdown Editor",
  category: "Editor",
  inputFields: [
    {
      key: "markdown",
      label: "Markdown",
      component: "Code",
      defaultValue: "",
      props: {
        language: "markdown"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Markdown"
    }
  ],
  action({ inputValues }) {
    const { markdown } = inputValues
    return { output: markdown }
  }
}

export default markdownParserTool
