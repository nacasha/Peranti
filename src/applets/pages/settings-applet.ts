import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"

const settingsApplet: AppletConstructor = {
  appletId: "settings-page",
  name: "Settings",
  category: "App",
  layoutSetting: {
    gridTemplate: "1fr"
  },
  inputFields: [],
  outputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "Settings"
    }
  ],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
}

export default settingsApplet
