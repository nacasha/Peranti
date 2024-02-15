import { type FC } from "react"

import { type Component } from "src/models/Component.ts"
import { type appletComponentService } from "src/services/applet-component-service.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractType<T> = T extends Component<FC<OutputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<typeof appletComponentService.outputs.Diff>
  export type Text = ExtractType<typeof appletComponentService.outputs.Text>
  export type TextArea = ExtractType<typeof appletComponentService.outputs.TextArea>
  export type GridStat = ExtractType<typeof appletComponentService.outputs.GridStat>
  export type Image = ExtractType<typeof appletComponentService.outputs.Image>
  export type File = ExtractType<typeof appletComponentService.outputs.File>
  export type Code = ExtractType<typeof appletComponentService.outputs.Code>
  export type Markdown = ExtractType<typeof appletComponentService.outputs.Markdown>
  export type IFrame = ExtractType<typeof appletComponentService.outputs.IFrame>
  export type Mermaid = ExtractType<typeof appletComponentService.outputs.Mermaid>
}
