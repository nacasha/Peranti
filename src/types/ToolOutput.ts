import { type ToolComponent } from "src/models/ToolComponent.ts"
import { type toolComponentService } from "src/services/toolComponentService.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends ToolComponent<React.FC<infer P>>
  ? Omit<P, keyof OutputComponentProps>
  : never

export type ToolOutput<K extends Record<string, string> = any> = {
  /**
   * Output field key
   */
  key: Extract<keyof K, string>

  /**
   * Label of field
   */
  label: string

  /**
   * Allow this field to have batch mode
   */
  allowBatch?: boolean
} & ({
  component: "Settings"
} | {
  component: "Text"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.Text>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.TextArea>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.GridStat>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.Diff>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.Image>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.File>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.Code>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.Markdown>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<typeof toolComponentService.outputs.IFrame>
})
