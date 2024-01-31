import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CodeInput.scss"

interface CodeInputProps extends InputComponentProps, BaseCodeMirrorProps {
  autoFocus?: boolean
}

export const CodeInput: FC<CodeInputProps> = (props) => {
  const {
    defaultValue = "",
    initialState,
    label,
    onStateChange,
    onSubmit,
    readOnly,
    ...baseCodeMirrorProps
  } = props

  const onInputChange = (newValue: string) => {
    onSubmit(newValue)
  }

  return (
    <div className="CodeInput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <BaseCodeMirror
        {...baseCodeMirrorProps}
        value={defaultValue}
        onChange={(newValue) => { onInputChange(newValue) }}
        onStateChange={onStateChange}
        initialStateCodeMirror={initialState as any}
        readOnly={readOnly}
      />
    </div>
  )
}
