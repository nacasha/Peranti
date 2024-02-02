import { type FC } from "react"

import { type ToolComponent } from "src/models/ToolComponent.ts"
import { type toolOutputComponents } from "src/services/toolOutputComponents.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractType<T> = T extends ToolComponent<FC<OutputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<typeof toolOutputComponents.Diff>
  export type Text = ExtractType<typeof toolOutputComponents.Text>
  export type TextArea = ExtractType<typeof toolOutputComponents.TextArea>
  export type GridStat = ExtractType<typeof toolOutputComponents.GridStat>
  export type Image = ExtractType<typeof toolOutputComponents.Image>
  export type File = ExtractType<typeof toolOutputComponents.File>
  export type Code = ExtractType<typeof toolOutputComponents.Code>
  export type Markdown = ExtractType<typeof toolOutputComponents.Markdown>
  export type IFrame = ExtractType<typeof toolOutputComponents.IFrame>
}
