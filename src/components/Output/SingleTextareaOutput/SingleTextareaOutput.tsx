import { useId, type FC } from "react"

import "./SingleTextareaOutput.scss"

interface SingleTextareaOutputProps {
  output: string
  label: string
}

export const SingleTextareaOutput: FC<SingleTextareaOutputProps> = (props) => {
  const id = useId()
  const { output, label = "Output" } = props

  return (
    <div className="SingleTextareaOutput">
      <label htmlFor={id} className="InputOutputLabel">{label}</label>
      <div className="box-container">
        <textarea id={id} className="box" value={output} readOnly />
      </div>
    </div>
  )
}
