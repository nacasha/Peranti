import { type FC, type ReactNode } from "react"

interface ExtensionsPagePlaceholderProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

/**
 * Centered message filling the pane, for an empty or unavailable state
 */
export const ExtensionsPagePlaceholder: FC<ExtensionsPagePlaceholderProps> = ({ icon, title, description, action }) => (
  <div className="ExtensionsPage-placeholder">
    {icon}
    <div className="ExtensionsPage-placeholder-title">{title}</div>
    <div className="ExtensionsPage-placeholder-description">{description}</div>
    {action}
  </div>
)
