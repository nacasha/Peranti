import { type KeyValueOutputProps } from "src/components/outputs/KeyValueOutput/KeyValueOutput.tsx"
import { type AppletComponent } from "src/models/AppletComponent.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

import { type FieldAction } from "./FieldAction.ts"
import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends AppletComponent<React.FC<infer P>>
  ? Omit<P, keyof OutputComponentProps>
  : never

export type AppletOutput<K extends Record<string, string> | any = any> = {
  key: Extract<keyof K, string>
  label: string
  allowBatch?: boolean

  /**
   * Show a "Regenerate" button in the field header that re-runs the applet
   */
  showRegenerateButton?: boolean

  /**
   * Buttons in the field header, see `FieldAction`. `{ "id": "run" }` runs
   * the tool, any other id goes to the field's extension component
   */
  actions?: FieldAction[]

  /**
   * Leave this field out of the history list preview. `false` shows it even
   * when its component is hidden by default (e.g. DataGrid).
   */
  hideInHistory?: boolean
} & ({
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
} | {
  component: "DataGrid"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.DataGrid>
} | {
  component: "JsonTree"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.JsonTree>
} | {
  component: "Color"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.Color>
} | {
  component: "ColorPallete"
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.ColorPallete>
} | {
  component: "KeyValue"
  /**
   * `label` is the card title. KeyValue fields sharing the same `label` are
   * rendered together as one card, one row per field.
   */
  props?: ExtractOutputComponentProps<typeof appletComponentService.outputs.KeyValue> & Pick<KeyValueOutputProps, "label">
})
