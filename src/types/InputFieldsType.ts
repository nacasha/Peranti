import { type FC } from "react"

import { type AppletComponent } from "src/models/AppletComponent.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractType<T> = T extends AppletComponent<FC<InputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Run = ExtractType<typeof appletComponentService.inputs.Run>
  export type Checkbox = ExtractType<typeof appletComponentService.inputs.Checkbox>
  export type TextArea = ExtractType<typeof appletComponentService.inputs.TextArea>
  export type Text = ExtractType<typeof appletComponentService.inputs.Text>
  export type Switch = ExtractType<typeof appletComponentService.inputs.Switch>
  export type File = ExtractType<typeof appletComponentService.inputs.File>
  export type Select = ExtractType<typeof appletComponentService.inputs.Select>
  export type Code = ExtractType<typeof appletComponentService.inputs.Code>
}
