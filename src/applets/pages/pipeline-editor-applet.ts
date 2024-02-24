import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"

const pipelineEditorApplet: AppletConstructor = {
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
}

export default pipelineEditorApplet
