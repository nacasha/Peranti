import { CodeOutput } from "./CodeOutput"
import { DiffOutput } from "./DiffOutput"
import { FileOutput } from "./FileOutput"
import { GridStatOutput } from "./GridStatOutput"
import { ImageOutput } from "./ImageOutput"
import { TextAreaOutput } from "./TextAreaOutput"
import { TextOutput } from "./TextOutput"

export const listOfOutputComponent = {
  TextArea: TextAreaOutput,
  Text: TextOutput,
  GridStat: GridStatOutput,
  Diff: DiffOutput,
  Image: ImageOutput,
  File: FileOutput,
  Code: CodeOutput
}
