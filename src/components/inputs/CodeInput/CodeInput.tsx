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
    label,
    defaultValue = "",
    initialState,
    onValueChange,
    readOnly,
    fieldKey,
    ...baseCodeMirrorProps
  } = props

  const onInputChange = (newValue: string) => {
    onValueChange(newValue)
  }

  return (
    <div className="CodeInput" style={{ gridArea: fieldKey }}>
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
