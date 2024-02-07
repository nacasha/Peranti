import { type FC } from "react"

import { type Component } from "src/models/Component.ts"
import { type componentService } from "src/services/component-manager.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractType<T> = T extends Component<FC<InputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Run = ExtractType<typeof componentService.inputs.Run>
  export type Checkbox = ExtractType<typeof componentService.inputs.Checkbox>
  export type TextArea = ExtractType<typeof componentService.inputs.TextArea>
  export type Text = ExtractType<typeof componentService.inputs.Text>
  export type Switch = ExtractType<typeof componentService.inputs.Switch>
  export type File = ExtractType<typeof componentService.inputs.File>
  export type Select = ExtractType<typeof componentService.inputs.Select>
  export type Code = ExtractType<typeof componentService.inputs.Code>
}
