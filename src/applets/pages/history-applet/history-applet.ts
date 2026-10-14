import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

export const historyApplet = new AppletConstructor({
  appletId: "history-page",
  name: "History",
  category: "App",
  inputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "History"
    }
  ],
  outputFields: [],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
})
