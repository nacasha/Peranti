import { BinaryOutput } from "./BinaryOutput"
import { DiffOutput } from "./DiffOutput"
import { GridStatOutput } from "./GridStatOutput"
import { TextOutput } from "./TextOutput"
import { TextareaOutput } from "./TextareaOutput"

export const listOfOutputComponent = {
  Textarea: TextareaOutput,
  Text: TextOutput,
  GridStat: GridStatOutput,
  Diff: DiffOutput,
  ImageBinary: BinaryOutput
}
