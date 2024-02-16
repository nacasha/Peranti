import clsx from "clsx"
import { type FC, useState } from "react"

import { Icons } from "src/constants/icons"

import { secondarySidebarClasses } from "./SecondarySidebar.css"

export const SecondarySidebarSection: FC<{ children: any, title: any }> = ({ children, title }) => {
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
      <div className={secondarySidebarClasses.sectionBody}>
        {children}
      </div>
    </div>
  )
}
