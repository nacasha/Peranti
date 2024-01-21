import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./TextareaOutput.scss"

interface TextareaOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const TextareaOutput: FC<TextareaOutputProps> = (props) => {
  const { output, label = "Output", ...restprops } = props

  return (
    <div className="TextareaOutput">
      <label className="InputOutputLabel">{label}</label>
      <div className="CodeMirrorContainer">
        <BaseCodeMirror
          {...restprops}
          value={typeof output === "string" ? output : JSON.stringify(output, null, 2)}
          readOnly
        />
      </div>
    </div>
  )
}
