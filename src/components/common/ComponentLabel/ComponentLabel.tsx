import { type FC } from "react"

import { componentLabelCss } from "./ComponentLabel.css"

interface ComponentLabelProps {
  label?: string
}

export const ComponentLabel: FC<ComponentLabelProps> = (props) => {
  const { label } = props

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <label className={componentLabelCss}>
        {label}
      </label>
    </div>
  )
}
