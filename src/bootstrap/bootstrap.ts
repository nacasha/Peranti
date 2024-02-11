import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "react-contexify/ReactContexify.css"
import "simplebar-react/dist/simplebar.min.css"

import "src/services/user-settings-service"
import "src/styles/fonts/inter-font.scss"
import "src/styles/globals.css"
import "src/styles/libraries/context-menu.css"
import "src/styles/libraries/notifications.css"
import "src/styles/libraries/simplebar.css"

configurePersistable({
  storage: localforage,
  stringify: false
})
