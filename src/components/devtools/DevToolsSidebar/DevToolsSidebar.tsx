import { toJS } from "mobx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"

import "./DevToolsSidebar.scss"

export const DevToolsSidebar: FC = () => {
  const activeSessionStoreData = useSelector(() => activeSessionStore)

  return (
    <div className="DevToolsSidebar">
      <div className="AppSidebarContent-title">Tools</div>
      {Object.entries(toJS(activeSessionStoreData)).map(([key, value]) => (
        <div key={key}>
          {key}
          <div>
            {JSON.stringify(value)}
          </div>
        </div>
      ))}
    </div>
  )
}
