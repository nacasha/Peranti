import clsx from "clsx"
import { type LucideIcon } from "lucide-react"
import { type FC, type ReactNode } from "react"

interface SecondarySidebarSectionProps {
  sectionKey: string
  children?: ReactNode
  title?: ReactNode
  icon?: LucideIcon
  hidden?: boolean
  actions?: ReactNode
}

// A flat group in the inspector: an optional small title, then its rows.
export const SecondarySidebarSection: FC<SecondarySidebarSectionProps> = (props) => {
  const { children, title, icon: Icon, hidden, sectionKey, actions } = props

  return (
    <section className={clsx("SecondarySidebarSection", { hidden })} data-section={sectionKey}>
      {title !== undefined && (
        <div className="SecondarySidebarSection-header">
          {Icon && <Icon size={13} aria-hidden />}
          <span>{title}</span>
          {actions && <div className="SecondarySidebarSection-actions">{actions}</div>}
        </div>
      )}
      <div className="SecondarySidebarSection-body">
        {children}
      </div>
    </section>
  )
}
