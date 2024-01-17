import { type listOfOutputComponent } from "src/components/outputs"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends React.FC<infer P> ? Omit<P, keyof OutputComponentProps> : never

interface BaseOutput<K extends Record<string, any> = any> {
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
}

interface ToolOutputText<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Text"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Text>
}

interface ToolOutputTextarea<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Textarea"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Textarea>
}

interface ToolOutputGridStat<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "GridStat"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.GridStat>
}

interface ToolOutputDiff<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "Diff"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.Diff>
}

interface ToolOutputImageBinary<K extends Record<string, string> = any> extends BaseOutput<K> {
  component: "ImageBinary"
  props?: ExtractOutputComponentProps<typeof listOfOutputComponent.ImageBinary>
}

export type ToolOutput<K extends Record<string, string> = any> =
  ToolOutputText<K>
  | ToolOutputTextarea<K>
  | ToolOutputGridStat<K>
  | ToolOutputDiff<K>
  | ToolOutputImageBinary<K>
