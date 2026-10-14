import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

export const workbenchApplet = new AppletConstructor({
  appletId: "workbench-page",
  name: "Manage",
  category: "App",
  inputFields: [
    {
      key: "content",
      label: "content",
      customComponent: true,
      component: "Workbench"
    }
  ],
  outputFields: [],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
})
