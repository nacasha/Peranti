import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  text: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Mermaid
}

const mermaidEditorTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "mermaid-editor",
  name: "Mermaid",
  category: "Diagram",
  description: "JavaScript based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically",
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
      label: "Mermaid Diagram",
      component: "Mermaid"
    }
  ],
  samples: [
    {
      name: "Pie",
      inputValues: {
        text: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`
      }
    },
    {
      name: "Flowchart",
      inputValues: {
        text: `flowchart LR
    subgraph subgraph1
        direction TB
        top1[top] --> bottom1[bottom]
    end
    subgraph subgraph2
        direction TB
        top2[top] --> bottom2[bottom]
    end
    %% ^ These subgraphs are identical, except for the links to them:

    %% Link *to* subgraph1: subgraph1 direction is mantained
    outside --> subgraph1
    %% Link *within* subgraph2:
    %% subgraph2 inherits the direction of the top-level graph (LR)
    outside ---> top2
        `
      }
    }
  ],
  action({ inputValues }) {
    const { text } = inputValues
    if (text.trim().length > 0) {
      return { output: text }
    }
    return { output: "" }
  }
})

export default mermaidEditorTool
