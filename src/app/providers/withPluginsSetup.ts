import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "simplebar-react/dist/simplebar.min.css"

export const withPluginsSetup = (component: () => React.ReactNode) => () => {
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
