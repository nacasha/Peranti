import { type AppletComponent } from "src/models/AppletComponent.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

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

type InputComponents = typeof appletComponentService.inputs

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

export type AppletInput<K extends Record<string, string> | any = any> = {
  key: Extract<keyof K, string>
  label: string
  defaultValue?: any
  allowBatch?: boolean
  skipValidateHasValue?: boolean
  customComponent?: boolean

  /**
   * Show a "Regenerate" button in the field header that re-runs the applet
   */
  showRegenerateButton?: boolean

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
