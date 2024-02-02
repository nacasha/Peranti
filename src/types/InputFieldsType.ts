import { type FC } from "react"

import { type toolInputComponents } from "src/services/toolInputComponents.ts"

import { type ToolComponent } from "../models/ToolComponent.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractType<T> = T extends ToolComponent<FC<InputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Run = ExtractType<typeof toolInputComponents.Run>
  export type Checkbox = ExtractType<typeof toolInputComponents.Checkbox>
  export type TextArea = ExtractType<typeof toolInputComponents.TextArea>
  export type Text = ExtractType<typeof toolInputComponents.Text>
  export type Switch = ExtractType<typeof toolInputComponents.Switch>
  export type File = ExtractType<typeof toolInputComponents.File>
  export type Select = ExtractType<typeof toolInputComponents.Select>
  export type Code = ExtractType<typeof toolInputComponents.Code>
}
