import { AppletType } from "src/enums/applet-type"
import { AppletConstructorModel } from "src/models/AppletConstructor"

const settingsApplet = new AppletConstructorModel({
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
