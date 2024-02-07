import { type ReactNode, type FC } from "react"

interface SettingsCardItemProps {
  label: string
  children?: ReactNode
}

export const SettingsCardItem: FC<SettingsCardItemProps> = (props) => {
  const { label, children } = props

  return (
    <div className="SettingsCardItem">
      <div className="SettingsCardItem-label">
        {label}
      </div>
      <div className="SettingsCardItem-value">
        {children}
      </div>
    </div>
  )
}
