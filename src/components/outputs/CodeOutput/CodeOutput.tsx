import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./CodeOutput.scss"

interface CodeOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const CodeOutput: FC<CodeOutputProps> = (props) => {
  const { output, label = "Output", ...restprops } = props

  return (
    <div className="CodeOutput">
      <label className="InputOutputLabel">
        {label}
      </label>
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
