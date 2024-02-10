import { type FC } from "react"

import { type Component } from "src/models/Component.ts"
import { type componentService } from "src/services/component-manager.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractType<T> = T extends Component<FC<OutputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<typeof componentService.outputs.Diff>
  export type Text = ExtractType<typeof componentService.outputs.Text>
  export type TextArea = ExtractType<typeof componentService.outputs.TextArea>
  export type GridStat = ExtractType<typeof componentService.outputs.GridStat>
  export type Image = ExtractType<typeof componentService.outputs.Image>
  export type File = ExtractType<typeof componentService.outputs.File>
  export type Code = ExtractType<typeof componentService.outputs.Code>
  export type Markdown = ExtractType<typeof componentService.outputs.Markdown>
  export type IFrame = ExtractType<typeof componentService.outputs.IFrame>
  export type Mermaid = ExtractType<typeof componentService.outputs.Mermaid>
}
