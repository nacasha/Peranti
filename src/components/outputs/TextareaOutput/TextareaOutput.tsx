import { useId, type FC } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./TextAreaOutput.scss"

interface TextAreaOutputProps extends OutputComponentProps {}

export const TextAreaOutput: FC<TextAreaOutputProps> = (props) => {
  const id = useId()
  const { value, label = "Output" } = props

  return (
    <div className="TextAreaOutput">
      <label htmlFor={id} className="InputOutputLabel">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        readOnly
      />
    </div>
  )
}
