import { CodeOutput } from "src/components/outputs/CodeOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput"
import { TextOutput } from "src/components/outputs/TextOutput"
import { ToolComponent } from "src/models/ToolComponent"

export const toolOutputComponents = {
  Code: new ToolComponent({
    component: CodeOutput,
    copyAs: "text",
    saveAs: "text"
  }),

  Diff: new ToolComponent({
    component: DiffOutput
  }),

  File: new ToolComponent({
    component: FileOutput
  }),

  GridStat: new ToolComponent({
    component: GridStatOutput
  }),

  IFrame: new ToolComponent({
    component: IFrameOutput
  }),

  Image: new ToolComponent({
    component: ImageOutput,
    saveAs: "image"
  }),

  Markdown: new ToolComponent({
    component: MarkdownOutput,
    copyAs: "text",
    saveAs: "text"
  }),

  TextArea: new ToolComponent({
    component: TextAreaOutput,
    copyAs: "text",
    saveAs: "text"
  }),

  Text: new ToolComponent({
    component: TextOutput,
    batchComponent: CodeOutput,
    copyAs: "text",
    saveAs: "text"
  })
}
