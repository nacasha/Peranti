import { toJS } from "mobx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./DevToolsSidebar.scss"

export const DevToolsSidebar: FC = () => {
  const toolRunnerStoreData = useSelector(() => toolRunnerStore)

  return (
    <div className="DevToolsSidebar">
      <div className="AppSidebarContent-title">Tools</div>
      {Object.entries(toJS(toolRunnerStoreData)).map(([key, value]) => (
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
