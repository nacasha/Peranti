import clsx from "clsx"
import { useRef, type FC, type ReactNode, useEffect, useState } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState(0)

  const handleClickTitle = () => {
    secondarySidebarService.setExpandedSection(sectionKey, !expanded)
  }

  const calculateBodyHeight = () => {
    if (expanded && containerRef.current !== null) {
      const body = containerRef.current.querySelector(".SecondarySidebarSection-body")
      if (body) {
        setMaxHeight(body.getBoundingClientRect().height + 33)
      }
    } else {
      setMaxHeight(33)
    }
  }

  useEffect(() => {
    calculateBodyHeight()
  }, [expanded, containerRef.current, children])

  useEffect(() => {
    calculateBodyHeight()
  }, [])

  return (
    <div
      ref={containerRef}
      className={clsx("SecondarySidebarSection", { expanded, hidden })}
      style={{ maxHeight }}
    >
      <div onClick={handleClickTitle} className="SecondarySidebarSection-header">
        <div>
          <img src={expanded ? Icons.ChevronDown : Icons.ChevronRight} />
        </div>
        <div className="SecondarySidebarSection-title">
          {title}
        </div>
      </div>
      <div
        className="SecondarySidebarSection-body"
        style={{ padding: padding ? "3px 10px 10px" : 0 }}
      >
        {children}
      </div>
    </div>
  )
}
