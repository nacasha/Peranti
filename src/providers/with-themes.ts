// import "src/styles/root.scss"
import "src/styles/fonts.scss"
import "src/styles/globals.css"
import "src/styles/libraries/context-menu.css"
import "src/styles/libraries/notifications.css"
import "src/styles/libraries/simplebar.css"

export const withThemes = (component: () => React.ReactNode) => () => {
  return component()
}
