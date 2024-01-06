import { type FC, useId } from "react"

import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./TextOutput.scss"

export const TextOutput: FC<OutputComponentProps> = (props) => {
  const id = useId()
  const { output, label = "Output" } = props

  return (
    <div className="TextOutput">
      <label className="InputOutputLabel" htmlFor={id}>{label}</label>
      <input id={id} value={output} readOnly />
    </div>
  )
}
