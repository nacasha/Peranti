import clsx from "clsx"
import { type FC, useState, type ReactNode } from "react"

import { Icons } from "src/constants/icons"

interface SecondarySidebarSectionProps {
  children?: ReactNode
  title: ReactNode
  padding?: boolean
}

export const SecondarySidebarSection: FC<SecondarySidebarSectionProps> = (props) => {
  const { children, title, padding } = props
  const [expanded, setExpanded] = useState(true)

  const handleClickTitle = () => {
    setExpanded((e) => !e)
  }

  return (
    <div className={clsx("SecondarySidebarSection", { expanded })}>
      <div onClick={handleClickTitle} className="SecondarySidebarSection-header">
        <div>
          <img src={expanded ? Icons.ChevronUp : Icons.ChevronDown} />
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
