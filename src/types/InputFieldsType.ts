import { type FC } from "react"

import { type InputComponents } from "src/components/registry/input-components.ts"
import { type AppletComponent } from "src/models/AppletComponent.ts"

import { type InputComponentProps } from "./InputComponentProps.ts"

type ExtractType<T> = T extends AppletComponent<FC<InputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Run = ExtractType<InputComponents["Run"]>
  export type Checkbox = ExtractType<InputComponents["Checkbox"]>
  export type TextArea = ExtractType<InputComponents["TextArea"]>
  export type Text = ExtractType<InputComponents["Text"]>
  export type Switch = ExtractType<InputComponents["Switch"]>
  export type File = ExtractType<InputComponents["File"]>
  export type Files = ExtractType<InputComponents["Files"]>
  export type Select = ExtractType<InputComponents["Select"]>
  export type ListReorder = ExtractType<InputComponents["ListReorder"]>
  export type ListPick = ExtractType<InputComponents["ListPick"]>
  export type DateTime = ExtractType<InputComponents["DateTime"]>
  export type DateRange = ExtractType<InputComponents["DateRange"]>
  export type Code = ExtractType<InputComponents["Code"]>
}
