import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CodeInput.scss"

interface CodeInputProps extends InputComponentProps, BaseCodeMirrorProps {
  autoFocus?: boolean
}

export const CodeInput: FC<CodeInputProps> = (props) => {
  const { onSubmit, defaultValue = "", readOnly, label, ...restProps } = props

  const onInputChange = (newValue: string) => {
    onSubmit(newValue)
  }

  return (
    <div className="CodeInput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <BaseCodeMirror
        {...restProps}
        value={defaultValue}
        onChange={(newValue) => { onInputChange(newValue) }}
        readOnly={readOnly}
      />
    </div>
  )
}
