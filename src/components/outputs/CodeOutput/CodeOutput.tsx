import { type FC, useMemo } from "react"

import { BaseCodeMirror, type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"
import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { LargeTextViewer } from "src/components/common/LargeTextViewer"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"
import { isLargeText } from "src/utils/text/is-large-text"

import "./CodeOutput.scss"

interface CodeOutputProps extends OutputComponentProps, BaseCodeMirrorProps {}

export const CodeOutput: FC<CodeOutputProps> = (props) => {
  const { value, label = "Output", initialState, fieldKey, ...baseCodeMirrorProps } = props

  const text = useMemo(() => typeof value === "string" ? value : JSON.stringify(value, null, 2), [value])

  return (
    <div className="CodeOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      {/* Large text is shown as plain text anyway, the viewer does that
          without the editor's layout cost */}
      {isLargeText(text)
        ? <LargeTextViewer text={text} onContextMenu={baseCodeMirrorProps.onContextMenu} />
        : (
          <BaseCodeMirror
            {...baseCodeMirrorProps}
            value={text}
            initialStateCodeMirror={initialState}
            readOnly
          />
        )}
    </div>
  )
}
