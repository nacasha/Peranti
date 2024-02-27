import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

const settingsApplet = new AppletConstructor({
  appletId: "settings-page",
  name: "Settings",
  category: "App",
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
})

export default settingsApplet
