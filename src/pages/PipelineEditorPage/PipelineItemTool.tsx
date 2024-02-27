import { Icons } from "src/constants/icons.js"
import { useSelector } from "src/hooks/useSelector"
import { appletStore } from "src/services/applet-store"

import { PipelineItem } from "./PipelineItem.js"

export const PipelineItemTool = (props: any) => {
  const { data } = props
  const { appletId } = data
  const applet = useSelector(() => appletStore.mapOfLoadedApplets[appletId])

  const inputFields = typeof applet.inputFields === "function" ? applet.inputFields({}) : applet.inputFields
  const outputFields = typeof applet.outputFields === "function" ? applet.outputFields({}) : applet.outputFields

  /**
   * Dont show input field for Run component
   */
  const filteredInputFields = inputFields.filter((inputField) => inputField.component !== "Run")

  return (
    <PipelineItem
      icon={Icons.Tool}
      title={applet.name}
      targets={filteredInputFields.map((inputField) => ({
        id: inputField.key,
        label: inputField.label
      }))}
      sources={outputFields.map((outputField) => ({
        id: outputField.key,
        label: outputField.label
      }))}
    />
  )
}
