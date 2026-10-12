import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

export const extensionsApplet = new AppletConstructor({
  appletId: "extensions-page",
  name: "Extensions",
  category: "App",
  inputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "Extensions"
    }
  ],
  outputFields: [],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
})
