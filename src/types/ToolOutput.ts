import { type listOfOutputComponent } from "src/components/outputs"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof OutputComponentProps> : never

export type ToolOutput<K extends Record<string, string> = any> = {
  /**
   * Field name that will be used as key in output map to show the value
   */
  key: keyof K

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
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Text>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.TextArea>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.GridStat>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Diff>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Image>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.File>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Code>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Markdown>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.IFrame>
})
