import { Position } from "reactflow"

import { useSelector } from "src/hooks/useSelector"
import { appletStore } from "src/services/applet-store"

import { CustomHandle } from "./CustomHandle.js"
import { pipelineItemClasses } from "./PipelineItem.css"

export const PipelineItem = (props: any) => {
  const { data } = props
  const { appletId } = data
  const applet = useSelector(() => appletStore.mapOfLoadedApplets[appletId])

  const inputFields = typeof applet.inputFields === "function" ? applet.inputFields({}) : applet.inputFields
  const outputFields = typeof applet.outputFields === "function" ? applet.outputFields({}) : applet.outputFields
  const numberOfFields = Math.max(inputFields.length, outputFields.length)

  return (
    <div className={pipelineItemClasses.root}>
      <div className={pipelineItemClasses.title}>
        {applet.name}
      </div>
      <div className={pipelineItemClasses.handles} style={{ height: 35 * numberOfFields }}>
        <div className={pipelineItemClasses.handlesLeft}>
          {inputFields.map((inputField, index) => (
            <div key={inputField.key} style={{ top: 35 * index }}>
              <label>
                {inputField.label}
              </label>
              <CustomHandle
                id={inputField.key}
                type="target"
                position={Position.Left}
                isConnectable={true}
              />
            </div>
          ))}
        </div>
        <div className={pipelineItemClasses.handlesRight}>
          {outputFields.map((outputField, index) => (
            <div key={outputField.key} style={{ top: 35 * index }}>
              <label>
                {outputField.label}
              </label>
              <CustomHandle
                id={outputField.key}
                type="source"
                position={Position.Right}
                isConnectable={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
