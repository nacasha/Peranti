import { type Component } from "src/models/Component.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends Component<React.FC<infer P>>
  ? Omit<P, keyof OutputComponentProps>
  : never

export type AppletOutput<K extends Record<string, string> = any> = {
  key: Extract<keyof K, string>
  label: string
  allowBatch?: boolean
} & ({
  component: "Settings"
  props?: any
} | {
  component: "Text"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Text>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.TextArea>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.GridStat>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Diff>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Image>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.File>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Code>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Markdown>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.IFrame>
} | {
  component: "Mermaid"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Mermaid>
} | {
  component: "Pintora"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Mermaid>
} | {
  component: "React"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.React>
})
