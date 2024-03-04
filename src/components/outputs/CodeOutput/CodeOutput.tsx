import { type FC } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./CodeOutput.scss"

interface CodeOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const CodeOutput: FC<CodeOutputProps> = (props) => {
  const { value, label = "Output", initialState, fieldKey, ...baseCodeMirrorProps } = props

  return (
    <div className="CodeOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <BaseCodeMirror
        {...baseCodeMirrorProps}
        value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
        initialStateCodeMirror={initialState}
        readOnly
      />
    </div>
  )
}
