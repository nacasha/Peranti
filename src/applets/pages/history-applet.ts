import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

const historyApplet = new AppletConstructor({
  appletId: "history-page",
  name: "History",
  category: "App",
  inputFields: [],
  outputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "History"
    }
  ],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
})

export default historyApplet
