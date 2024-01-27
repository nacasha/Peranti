import { RunInput } from "./ButtonInput"
import { CheckboxInput } from "./CheckboxInput"
import { CodeInput } from "./CodeInput"
import { FileInput } from "./FileInput"
import { SelectInput } from "./SelectInput"
import { SwitchInput } from "./SwitchInput"
import { TextAreaInput } from "./TextAreaInput"
import { TextInput } from "./TextInput"

export const listOfInputComponent = {
  Checkbox: CheckboxInput,
  TextArea: TextAreaInput,
  Text: TextInput,
  Select: SelectInput,
  Switch: SwitchInput,
  Run: RunInput,
  File: FileInput,
  Code: CodeInput
}
