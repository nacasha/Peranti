import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CodeInput.scss"

interface CodeInputProps extends InputComponentProps, BaseCodeMirrorProps {
  autoFocus?: boolean
}

export const CodeInput: FC<CodeInputProps> = (props) => {
  const {
    label,
    value = "",
    initialState,
    onValueChange,
    readOnly,
    fieldKey,
    ...baseCodeMirrorProps
  } = props

  const onInputChange = (newValue: string) => {
    onValueChange(newValue)
  }

  console.log({ defaultValue: value })

  return (
    <div className="CodeInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <BaseCodeMirror
        {...baseCodeMirrorProps}
        value={value}
        onChange={(newValue) => { onInputChange(newValue) }}
        initialStateCodeMirror={initialState }
        readOnly={readOnly}
      />
    </div>
  )
}
