import { observer } from "mobx-react"
import { type FC, useState } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextareaInput.scss"

interface TextareaInputProps extends InputComponentProps, BaseCodeMirrorProps {}

export const TextareaInput: FC<TextareaInputProps> = observer((props) => {
  const { onSubmit, defaultValue, readOnly, label, ...restProps } = props
  const [value, setValue] = useState<string>(() => defaultValue ?? "")

  const onInputChange = (newValue: string) => {
    setValue(newValue)
    onSubmit(newValue)
  }

  return (
    <div className="TextareaInput">
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
})
