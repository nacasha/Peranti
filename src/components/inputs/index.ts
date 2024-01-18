import { ButtonInput } from "./ButtonInput"
import { CheckboxInput } from "./CheckboxInput"
import { FileInput } from "./FileInput"
import { SelectInput } from "./SelectInput"
import { SwitchInput } from "./SwitchInput"
import { TextInput } from "./TextInput"
import { TextareaInput } from "./TextareaInput"

export const listOfInputComponent = {
  Checkbox: CheckboxInput,
  Textarea: TextareaInput,
  Text: TextInput,
  Select: SelectInput,
  Switch: SwitchInput,
  Button: ButtonInput,
  File: FileInput
}
