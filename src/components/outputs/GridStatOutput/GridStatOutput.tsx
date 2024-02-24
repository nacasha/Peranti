import { type FC } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./GridStatOutput.scss"

interface Output {
  label: string | number
  value: string | number
}

interface GridStatOutputProps extends OutputComponentProps<Output[]> { }

export const GridStatOutput: FC<GridStatOutputProps> = (props) => {
  let { value = [], fieldKey } = props

  if (!Array.isArray(value)) {
    value = []
  }

  return (
    <div className="GridStatOutput" style={{ gridArea: fieldKey }}>
      {value.map((item) => (
        <div key={item.label} className="GridStatOutput-item">
          <div className="GridStatOutput-item-label">{item.label}</div>
          <div className="GridStatOutput-item-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
