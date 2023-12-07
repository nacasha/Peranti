import { createStore } from "@udecode/zustood"

const uiStore = createStore("ui")({
  hiddenSidebar: false
})
  .extendActions(
    (set, get) => ({
      toggleSidebar: () => {
        set.hiddenSidebar(!get.hiddenSidebar())
      }
    })
  )

export default uiStore
