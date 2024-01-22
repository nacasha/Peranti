import { type FC } from "react"

import { type listOfInputComponent } from "src/components/inputs/index.js"

import { type InputComponentProps } from "./InputComponentProps.js"

type ExtractType<T> = T extends FC<InputComponentProps<infer P>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Button = ExtractType<typeof listOfInputComponent.Button>
  export type Checkbox = ExtractType<typeof listOfInputComponent.Checkbox>
  export type TextArea = ExtractType<typeof listOfInputComponent.TextArea>
  export type Text = ExtractType<typeof listOfInputComponent.Text>
  export type Switch = ExtractType<typeof listOfInputComponent.Switch>
  export type File = ExtractType<typeof listOfInputComponent.File>
  export type Select = ExtractType<typeof listOfInputComponent.Select>
  export type Code = ExtractType<typeof listOfInputComponent.Code>
}
