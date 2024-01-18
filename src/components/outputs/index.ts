import { DiffOutput } from "./DiffOutput"
import { FileOutput } from "./FileOutput"
import { GridStatOutput } from "./GridStatOutput"
import { ImageOutput } from "./ImageOutput"
import { TextOutput } from "./TextOutput"
import { TextareaOutput } from "./TextareaOutput"

export const listOfOutputComponent = {
  Textarea: TextareaOutput,
  Text: TextOutput,
  GridStat: GridStatOutput,
  Diff: DiffOutput,
  Image: ImageOutput,
  File: FileOutput
}
