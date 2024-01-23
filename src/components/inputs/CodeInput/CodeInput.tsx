import { type FC, useState } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CodeInput.scss"

interface CodeInputProps extends InputComponentProps, BaseCodeMirrorProps {
  autoFocus?: boolean
}

export const CodeInput: FC<CodeInputProps> = (props) => {
  const { onSubmit, defaultValue, readOnly, label, ...restProps } = props
  const [value, setValue] = useState<string>(() => defaultValue ?? "")

  const onInputChange = (newValue: string) => {
    setValue(newValue)
    onSubmit(newValue)
  }

  return (
    <div className="CodeInput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <div className="CodeMirrorContainer">
        <BaseCodeMirror
          {...restProps}
          value={value}
          onChange={(newValue) => { onInputChange(newValue) }}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
