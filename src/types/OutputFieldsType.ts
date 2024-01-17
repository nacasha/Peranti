import { type listOfOutputComponent } from "src/components/outputs/index.js"

import { type OutputComponentProps } from "./OutputComponentProps.js"

type ExtractOutput<T> = T extends React.FC<OutputComponentProps<infer P>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractOutput<typeof listOfOutputComponent.Diff>
  export type Text = ExtractOutput<typeof listOfOutputComponent.Text>
  export type Textarea = ExtractOutput<typeof listOfOutputComponent.Textarea>
  export type GridStat = ExtractOutput<typeof listOfOutputComponent.GridStat>
  export type Image = ExtractOutput<typeof listOfOutputComponent.Image>
}
