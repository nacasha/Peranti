import { type InputComponents } from "src/components/registry/input-components.ts"
import { type AppletComponent } from "src/models/AppletComponent.ts"

import { type FieldAction } from "./FieldAction.ts"
import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractInputComponentProps<T> = T extends AppletComponent<React.FC<infer P>>
  ? Omit<P, keyof InputComponentProps>
  : never

/**
 * A prop value taken from elsewhere. `type` says where it comes from
 * (only `"input"`: another input of the same applet), `transform` turns
 * the raw value into what the prop needs.
 */
export interface ComputedProp<K = any> {
  type: "input"
  key: Extract<keyof K, string>
  transform?: (value: any) => any
}

/**
 * A field of one input component: its static `props`, plus `computedProps`
 * that take the same prop names but resolve their values when rendered,
 * overriding the static ones
 */
interface InputComponentField<N extends keyof InputComponents, K> {
  component: N
  props?: ExtractInputComponentProps<InputComponents[N]>
  computedProps?: {
    [P in keyof ExtractInputComponentProps<InputComponents[N]>]?: ComputedProp<K>
  }
}

/**
 * One input field of an applet: which component renders it, how it's
 * labelled, and how it takes part in batch mode, history and validation
 */
export type AppletInput<K extends Record<string, string> | any = any> = {
  /**
   * Key of this field in the applet's input values
   */
  key: Extract<keyof K, string>

  /**
   * Text shown in the field header
   */
  label: string

  /**
   * Value the field starts with
   */
  defaultValue?: any

  /**
   * Let this field be the batch input in batch mode, where each line or file
   * is run through the applet on its own
   */
  allowBatch?: boolean

  /**
   * Ignore this field's value when checking whether the applet has any input,
   * e.g. a field that always has a value shouldn't trigger auto-run on its own
   */
  skipValidateHasValue?: boolean

  /**
   * `true` for the built-in page applets (Settings, History, …), which render
   * a full-page component instead of a regular input component
   */
  customComponent?: boolean

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
   * when its component is hidden by default (e.g. Select).
   */
  hideInHistory?: boolean
} & ({
  customComponent: true
  component: "PipelineEditor" | "Settings" | "History" | "Extensions" | "Workbench" | "ExtensionPage"
  props?: any
  computedProps?: undefined
}
| InputComponentField<"Text", K>
| InputComponentField<"DateTime", K>
| InputComponentField<"DateRange", K>
| InputComponentField<"TextArea", K>
| InputComponentField<"Switch", K>
| InputComponentField<"Run", K>
| InputComponentField<"Checkbox", K>
| InputComponentField<"Select", K>
| InputComponentField<"File", K>
| InputComponentField<"Files", K>
| InputComponentField<"Code", K>
| InputComponentField<"ListReorder", K>
| InputComponentField<"ListPick", K>
| InputComponentField<"ColorPicker", K>
)
