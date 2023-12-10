import { CheckboxInput } from "./CheckboxInput"
import { Select } from "./Select/Select"
import { SingleTextInput } from "./SingleTextInput"
import { SingleTextareaInput } from "./SingleTextareaInput"
import { Switch } from "./Switch"

export const listOfInputComponent = {
  Checkbox: CheckboxInput,
  Textarea: SingleTextareaInput,
  Text: SingleTextInput,
  Select,
  Switch
}
