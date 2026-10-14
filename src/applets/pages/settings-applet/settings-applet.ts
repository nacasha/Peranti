import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

export const settingsApplet = new AppletConstructor({
  appletId: "settings-page",
  name: "Settings",
  category: "App",
  inputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "Settings"
    }
  ],
  outputFields: [],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
})
