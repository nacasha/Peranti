import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

const settingsTool: AppletConstructor<InputFields> = {
  appletId: "settings-tool",
  name: "Settings",
  category: "App",
  layoutSetting: {
    gridTemplate: "1fr"
  },
  inputFields: [],
  outputFields: [
    {
      key: "web",
      label: "Web",
      component: "Settings"
    }
  ],
  disableMultipleSession: true,
  hideOnSidebar: true,
  type: AppletType.Page
}

export default settingsTool
