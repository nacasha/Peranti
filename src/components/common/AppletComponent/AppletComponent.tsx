import { type FC, type ReactNode } from "react"

import { AppletComponentHead } from "../ComponentLabel"

import "./AppletComponent.scss"

interface AppletComponentProps {
  fieldKey: string
  label?: string
  children: ReactNode
}

export const AppletComponent: FC<AppletComponentProps> = (props) => {
  const { fieldKey, label, children } = props

  return (
    <div className="AppletComponent" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      {children}
    </div>
  )
}
