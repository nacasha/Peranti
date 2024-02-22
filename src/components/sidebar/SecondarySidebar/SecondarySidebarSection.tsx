import clsx from "clsx"
import { type FC, useState, type ReactNode } from "react"

import { Icons } from "src/constants/icons"

import { secondarySidebarClasses } from "./SecondarySidebar.css"

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
    <div className={clsx(secondarySidebarClasses.section, { [secondarySidebarClasses.sectionExpanded]: expanded })}>
      <div onClick={handleClickTitle} className={secondarySidebarClasses.sectionHeader}>
        <div>
          <img src={expanded ? Icons.ChevronUp : Icons.ChevronDown} />
        </div>
        <div className={secondarySidebarClasses.sectionTitle}>
          {title}
        </div>
      </div>
      <div className={secondarySidebarClasses.sectionBody} style={{ padding: padding ? "3px 10px" : 0 }}>
        {children}
      </div>
    </div>
  )
}
