import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./CodeOutput.scss"

interface CodeOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const CodeOutput: FC<CodeOutputProps> = (props) => {
  const { value, label = "Output", ...restprops } = props

  return (
    <div className="CodeOutput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <BaseCodeMirror
        {...restprops}
        value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
        readOnly
      />
    </div>
  )
}
