import { type FC } from "react"

import { type ToolComponent } from "src/models/ToolComponent.ts"
import { type toolComponentService } from "src/services/toolComponentService.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractType<T> = T extends ToolComponent<FC<InputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Run = ExtractType<typeof toolComponentService.inputs.Run>
  export type Checkbox = ExtractType<typeof toolComponentService.inputs.Checkbox>
  export type TextArea = ExtractType<typeof toolComponentService.inputs.TextArea>
  export type Text = ExtractType<typeof toolComponentService.inputs.Text>
  export type Switch = ExtractType<typeof toolComponentService.inputs.Switch>
  export type File = ExtractType<typeof toolComponentService.inputs.File>
  export type Select = ExtractType<typeof toolComponentService.inputs.Select>
  export type Code = ExtractType<typeof toolComponentService.inputs.Code>
}
