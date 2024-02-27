import { AppletType } from "src/enums/applet-type"
import { AppletConstructor } from "src/models/AppletConstructor"

const pipelineEditorApplet = new AppletConstructor({
  appletId: "pipeline-editor",
  name: "Pipeline Editor",
  category: "App",
  inputFields: [
    {
      key: "$PIPELINE",
      label: "Pipeline",
      customComponent: true,
      component: "PipelineEditor"
    }
  ],
  outputFields: [],
  hideOnSidebar: true,
  type: AppletType.Pipeline
})

export default pipelineEditorApplet
