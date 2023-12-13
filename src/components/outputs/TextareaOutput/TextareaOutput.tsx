import { useId, type FC } from "react"

import "./TextareaOutput.scss"

interface TextareaOutputProps {
  output: string
  label: string
}

export const TextareaOutput: FC<TextareaOutputProps> = (props) => {
  const id = useId()
  const { output, label = "Output" } = props

  return (
    <div className="TextareaOutput">
      <label htmlFor={id} className="InputOutputLabel">{label}</label>
      <div className="box-container">
        <textarea id={id} className="box" value={output} readOnly />
      </div>
    </div>
  )
}
