import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "react-contexify/ReactContexify.css"
import "simplebar-react/dist/simplebar.min.css"

export const withMobxStore = (component: () => React.ReactNode) => () => {
  /**
   * Configure mobx persistable
   */
  configurePersistable({
    storage: localforage,

    /**
     * Disable stringify because we are using localforage
     */
    stringify: false
  })

  return component()
}
