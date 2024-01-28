import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  markdown: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Markdown
}

const markdownParserTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "markdown-parser",
  name: "Markdown Parser",
  category: "Markdown",
  layoutSetting: {
    direction: "horizontal"
  },
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
  action({ markdown }) {
    return { output: markdown }
  }
}

export default markdownParserTool
