import { type listOfOutputComponent } from "src/components/outputs/index.js"

import { type OutputComponentProps } from "./OutputComponentProps.js"

type ExtractType<T> = T extends React.FC<OutputComponentProps<infer P>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<typeof listOfOutputComponent.Diff>
  export type Text = ExtractType<typeof listOfOutputComponent.Text>
  export type TextArea = ExtractType<typeof listOfOutputComponent.TextArea>
  export type GridStat = ExtractType<typeof listOfOutputComponent.GridStat>
  export type Image = ExtractType<typeof listOfOutputComponent.Image>
  export type File = ExtractType<typeof listOfOutputComponent.File>
  export type Code = ExtractType<typeof listOfOutputComponent.Code>
  export type Markdown = ExtractType<typeof listOfOutputComponent.Markdown>
}
