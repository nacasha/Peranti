import { type listOfInputComponent } from "src/components/inputs/index.js"

import { type InputComponentProps } from "./InputComponentProps.js"

type ExtractType<T> = T extends React.FC<InputComponentProps<infer P>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace InputFieldsType {
  export type Button = ExtractType<typeof listOfInputComponent.Button>
  export type Checkbox = ExtractType<typeof listOfInputComponent.Checkbox>
  export type Textarea = ExtractType<typeof listOfInputComponent.Textarea>
  export type Text = ExtractType<typeof listOfInputComponent.Text>
  export type Switch = ExtractType<typeof listOfInputComponent.Switch>
  export type File = ExtractType<typeof listOfInputComponent.File>
  export type Select = ExtractType<typeof listOfInputComponent.Select>
}
