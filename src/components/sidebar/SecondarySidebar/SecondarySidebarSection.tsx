import clsx from "clsx"
import { type FC, type ReactNode } from "react"

import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { secondarySidebarService } from "src/services/secondary-sidebar-service"

interface SecondarySidebarSectionProps {
  sectionKey: string
  children?: ReactNode
  title: ReactNode
  padding?: boolean
  hidden?: boolean
}

export const SecondarySidebarSection: FC<SecondarySidebarSectionProps> = (props) => {
  const { children, title, padding, hidden, sectionKey } = props
  const expanded = useSelector(() => secondarySidebarService.expandedSection[sectionKey] ?? true)

  const handleClickTitle = () => {
    secondarySidebarService.setExpandedSection(sectionKey, !expanded)
  }

  return (
    <div className={clsx("SecondarySidebarSection", { expanded, hidden })}>
      <div onClick={handleClickTitle} className="SecondarySidebarSection-header">
        <div>
          <img src={expanded ? Icons.ChevronDown : Icons.ChevronRight} />
        </div>
        <div className="SecondarySidebarSection-title">
          {title}
        </div>
      </div>
      <div className="SecondarySidebarSection-body" style={{ padding: padding ? "3px 10px 10px" : 0 }}>
        {children}
      </div>
    </div>
  )
}
