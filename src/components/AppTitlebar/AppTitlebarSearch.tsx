import { observer } from "mobx-react"
import { toolStore } from "src/store/toolStore"

export const AppTitlebarSearch = observer(() => {
  return (
    <div className="AppTitlebarSearch">
      <div className="main">
        {toolStore.getActiveToolName()}
      </div>
    </div>
  )
})
