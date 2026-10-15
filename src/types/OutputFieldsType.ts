import { type FC } from "react"

import { type OutputComponents } from "src/components/registry/output-components.ts"
import { type AppletComponent } from "src/models/AppletComponent.ts"

import { type OutputComponentProps } from "./OutputComponentProps.ts"

type ExtractType<T> = T extends AppletComponent<FC<OutputComponentProps<infer P>>> ? P : never

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace OutputFieldsType {
  export type Diff = ExtractType<OutputComponents["Diff"]>
  export type Text = ExtractType<OutputComponents["Text"]>
  export type TextArea = ExtractType<OutputComponents["TextArea"]>
  export type GridStat = ExtractType<OutputComponents["GridStat"]>
  export type Image = ExtractType<OutputComponents["Image"]>
  export type File = ExtractType<OutputComponents["File"]>
  export type Code = ExtractType<OutputComponents["Code"]>
  export type Markdown = ExtractType<OutputComponents["Markdown"]>
  export type IFrame = ExtractType<OutputComponents["IFrame"]>
  export type Mermaid = ExtractType<OutputComponents["Mermaid"]>
  export type Pintora = ExtractType<OutputComponents["Pintora"]>
  export type React = ExtractType<OutputComponents["React"]>
  export type DataGrid = ExtractType<OutputComponents["DataGrid"]>
  export type JsonTree = ExtractType<OutputComponents["JsonTree"]>
  export type Color = ExtractType<OutputComponents["Color"]>
  export type KeyValue = ExtractType<OutputComponents["KeyValue"]>
}
