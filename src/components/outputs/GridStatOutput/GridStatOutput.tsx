import { type FC } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./GridStatOutput.scss"

interface Output {
  label: string | number
  value: string | number
}

export const GridStatOutput: FC<OutputComponentProps<Output[]>> = (props) => {
  let { output = [] } = props

  if (!Array.isArray(output)) {
    output = []
  }

  return (
    <div className="GridStatOutput">
      {output.map((item) => (
        <div key={item.label} className="GridStatOutput-item">
          <div className="GridStatOutput-item-label">{item.label}</div>
          <div className="GridStatOutput-item-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
