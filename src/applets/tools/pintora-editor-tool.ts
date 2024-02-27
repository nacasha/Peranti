import { AppletConstructorModel } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  syntax: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Pintora
}

const pintoraEditorTool = new AppletConstructorModel<InputFields, OutputFields>({
  appletId: "pintora-editor",
  name: "Pintora Editor",
  category: "Editor",
  description: "Pintora is a javascript text-to-diagrams library that works in both browser and Node.js",
  inputFields: [
    {
      key: "syntax",
      label: "Mermaid Syntax",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Pintora Diagram",
      component: "Pintora"
    }
  ],
  samples: [
    {
      name: "Activity Diagram",
      inputValues: {
        syntax: `activityDiagram
    start
    while (data available)
      :read data;
      :generate diagrams;
    endwhile

    while (met another test) is (yes)
      :do something;
    endwhile (done)
    end`
      }
    },
    {
      name: "Sequence Diagram",
      inputValues: {
        syntax: `sequenceDiagram
    title: Sequence Diagram Example
    autonumber
    User->>Pintora: render this
    activate Pintora
    loop Check input
      Pintora-->>Pintora: Has input changed?
    end
    Pintora-->>User: your figure here
    deactivate Pintora
    @note over User,Pintora: note over
    @note right of User: note aside actor
    @note right of User
    multiline note
    is possible
    @end_note
    == Divider ==`
      }
    },
    {
      name: "ER Diagram",
      inputValues: {
        syntax: `erDiagram
    title: Entity Relationship Example
    PERSON {
      string phone "phone number"
    }
    CUSTOMER inherit PERSON
    DELIVERER inherit PERSON
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    ORDER {
      int order_number PK
      string adress "delivery address"
    }
    DELIVERER ||--o{ DELIVERY : completes`
      }
    },
    {
      name: "Component Diagram",
      inputValues: {
        syntax: `componentDiagram
    title: Component Diagram Example
    package "@pintora/core" {
      () GraphicsIR
      () IRenderer
      () IDiagram
      [Diagram Registry] as registry
    }
    package "@pintora/diagrams" {
      [...Multiple Diagrams...] as diagrams
      [diagrams]
      [diagrams] --> IDiagram : implements
    }
    package "@pintora/renderer" {
      () "render()" as renderFn
      [SVGRender]
      [CanvasRender]
      [SVGRender] --> IRenderer : implements
      [CanvasRender] --> IRenderer : implements
      IRenderer ..> GraphicsIR : accepts
    }
    package "@pintora/standalone" {
      [standalone]
    }
    [IDiagram] --> GraphicsIR : generate
    [standalone] --> registry : register all of @pintora/diagrams
    [@pintora/standalone] --> [@pintora/diagrams] : import
    [standalone] --> renderFn : call with GraphicsIR`
      }
    },
    {
      name: "Gantt Diagram",
      inputValues: {
        syntax: `gantt
    title Gantt example
    excludes weekends
    section First
    A : t-a, 2022-2-17, 2022-2-23
    section Second
    B : t-b, after t-a, 2d
    C : t-c, after t-b, 2w
    section Third
    D : t-d, after t-c, 2d`
      }
    },
    {
      name: "Mind Map",
      inputValues: {
        syntax: `mindmap
    title: Mind Map Example
    + UML Diagrams
    ++ Behavior Diagrams
    +++ Sequence Diagram
    +++ State Diagram
    +++ Activity Diagram
    -- Structural Diagrams
    --- Class Diagram
    --- Component Diagram`
      }
    }
  ],
  action({ inputValues }) {
    const { syntax: text } = inputValues
    return { output: text }
  }
})

export default pintoraEditorTool
