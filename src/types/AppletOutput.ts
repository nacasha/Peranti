import { type KeyValueOutputProps } from "src/components/outputs/KeyValueOutput/KeyValueOutput.tsx"
import { type OutputComponents } from "src/components/registry/output-components.ts"
import { type AppletComponent } from "src/models/AppletComponent.ts"

import { type FieldAction } from "./FieldAction.ts"
import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractOutputComponentProps<T> = T extends AppletComponent<React.FC<infer P>>
  ? Omit<P, keyof OutputComponentProps>
  : never

/**
 * One output field of an applet: which component renders it, how it's
 * labelled, and how it takes part in batch mode and history
 */
export type AppletOutput<K extends Record<string, string> | any = any> = {
  /**
   * Key of this field in the applet's output values
   */
  key: Extract<keyof K, string>

  /**
   * Text shown in the field header
   */
  label: string

  /**
   * Let this field be picked as the batch output. Batch mode shows only the
   * picked output and hides the others
   */
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
  props?: ExtractOutputComponentProps<OutputComponents["Text"]>
} | {
  component: "TextArea"
  props?: ExtractOutputComponentProps<OutputComponents["TextArea"]>
} | {
  component: "GridStat"
  props?: ExtractOutputComponentProps<OutputComponents["GridStat"]>
} | {
  component: "Diff"
  props?: ExtractOutputComponentProps<OutputComponents["Diff"]>
} | {
  component: "Image"
  props?: ExtractOutputComponentProps<OutputComponents["Image"]>
} | {
  component: "File"
  props?: ExtractOutputComponentProps<OutputComponents["File"]>
} | {
  component: "Code"
  props?: ExtractOutputComponentProps<OutputComponents["Code"]>
} | {
  component: "Markdown"
  props?: ExtractOutputComponentProps<OutputComponents["Markdown"]>
} | {
  component: "IFrame"
  props?: ExtractOutputComponentProps<OutputComponents["IFrame"]>
} | {
  component: "Mermaid"
  props?: ExtractOutputComponentProps<OutputComponents["Mermaid"]>
} | {
  component: "Pintora"
  props?: ExtractOutputComponentProps<OutputComponents["Pintora"]>
} | {
  component: "React"
  props?: ExtractOutputComponentProps<OutputComponents["React"]>
} | {
  component: "DataGrid"
  props?: ExtractOutputComponentProps<OutputComponents["DataGrid"]>
} | {
  component: "JsonTree"
  props?: ExtractOutputComponentProps<OutputComponents["JsonTree"]>
} | {
  component: "Color"
  props?: ExtractOutputComponentProps<OutputComponents["Color"]>
} | {
  component: "ColorPallete"
  props?: ExtractOutputComponentProps<OutputComponents["ColorPallete"]>
} | {
  component: "KeyValue"
  /**
   * `label` is the card title. KeyValue fields sharing the same `label` are
   * rendered together as one card, one row per field.
   */
  props?: ExtractOutputComponentProps<OutputComponents["KeyValue"]> & Pick<KeyValueOutputProps, "label">
})
