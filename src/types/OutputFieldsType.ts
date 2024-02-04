import { type FC } from "react"

import { type ToolComponent } from "src/models/ToolComponent.ts"
import { type toolComponentService } from "src/services/toolComponentService.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractType<T> = T extends ToolComponent<FC<OutputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<typeof toolComponentService.outputs.Diff>
  export type Text = ExtractType<typeof toolComponentService.outputs.Text>
  export type TextArea = ExtractType<typeof toolComponentService.outputs.TextArea>
  export type GridStat = ExtractType<typeof toolComponentService.outputs.GridStat>
  export type Image = ExtractType<typeof toolComponentService.outputs.Image>
  export type File = ExtractType<typeof toolComponentService.outputs.File>
  export type Code = ExtractType<typeof toolComponentService.outputs.Code>
  export type Markdown = ExtractType<typeof toolComponentService.outputs.Markdown>
  export type IFrame = ExtractType<typeof toolComponentService.outputs.IFrame>
}
