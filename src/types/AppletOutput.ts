import { type Component } from "src/models/Component.ts"
import { type componentService } from "src/services/component-manager.ts"

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
  props?: ExtractOutputComponentProps<typeof componentService.outputs.Text>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.TextArea>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.GridStat>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.Diff>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.Image>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.File>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.Code>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.Markdown>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<typeof componentService.outputs.IFrame>
})
