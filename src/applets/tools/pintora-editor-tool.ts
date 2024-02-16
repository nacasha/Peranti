import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  text: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Mermaid
}

const pintoraEditorTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "pintora-editor",
  name: "Pintora Editor",
  category: "Editor",
  description: "JavaScript based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically",
  layoutSetting: {
    direction: "horizontal"
  },
  inputFields: [
    {
      key: "text",
      label: "Mermaid Syntax",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Diagram",
      component: "Mermaid"
    }
  ],
  action({ inputValues }) {
    const { text } = inputValues
    return { output: text }
  }
}

export default pintoraEditorTool
