import { type FC, useId } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextAreaInput.scss"

interface TextAreaInputProps extends InputComponentProps {
  autoFocus?: boolean
}

export const TextAreaInput: FC<TextAreaInputProps> = (props) => {
  const id = useId()
  const { onValueChange, value, readOnly, label = "Input", fieldKey, ...restProps } = props

  const onInputChange: React.InputHTMLAttributes<HTMLTextAreaElement>["onBlur"] = (event) => {
    const value = event.target.value
    onValueChange(value)
  }

  return (
    <div className="TextAreaInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <textarea
        id={id}
        value={value}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={5}
        {...restProps}
      />
    </div>
  )
}
