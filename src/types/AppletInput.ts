import { type AppletComponent } from "src/models/AppletComponent.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractInputComponentProps<T> = T extends AppletComponent<React.FC<infer P>>
  ? Omit<P, keyof InputComponentProps>
  : never

export type AppletInput<K extends Record<string, string> | any = any> = {
  key: Extract<keyof K, string>
  label: string
  defaultValue?: any
  allowBatch?: boolean
  skipValidateHasValue?: boolean
  customComponent?: boolean
} & ({
  customComponent: true
  component: "PipelineEditor"
  props?: any
} | {
  component: "Text"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Text>
} | {
  component: "TextArea"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.TextArea>
} | {
  component: "Switch"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Switch>
} | {
  component: "Run"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Run>
} | {
  component: "Checkbox"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Checkbox>
} | {
  component: "Select"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Select>
} | {
  component: "File"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.File>
} | {
  component: "Code"
  props?: ExtractInputComponentProps<typeof appletComponentService.inputs.Code>
})
