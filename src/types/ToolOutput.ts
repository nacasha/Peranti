import { type toolOutputComponents } from "src/services/toolOutputComponents.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof OutputComponentProps> : never

export type ToolOutput<K extends Record<string, string> = any> = {
  /**
   * Field name that will be used as key in output map to show the value
   */
  key: Extract<keyof K, string>

  /**
   * Label of field
   */
  label: string

  /**
   * Allow this field as batch operations
   */
  allowBatch?: boolean
} & ({
  component: "Text"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.Text.component>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.TextArea.component>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.GridStat.component>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.Diff.component>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.Image.component>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.File.component>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.Code.component>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.Markdown.component>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<typeof toolOutputComponents.IFrame.component>
})
