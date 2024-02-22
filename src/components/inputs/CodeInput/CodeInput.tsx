import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { ComponentLabel } from "src/components/common/ComponentLabel"
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
    onValueChange,
    readOnly,
    ...baseCodeMirrorProps
  } = props

  const onInputChange = (newValue: string) => {
    onValueChange(newValue)
  }

  return (
    <div className="CodeInput">
      <ComponentLabel label={label} />
      <BaseCodeMirror
        {...baseCodeMirrorProps}
        value={defaultValue}
        onChange={(newValue) => { onInputChange(newValue) }}
        initialStateCodeMirror={initialState }
        readOnly={readOnly}
      />
    </div>
  )
}
