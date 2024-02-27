import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { useState, type MouseEventHandler } from "react"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { SelectInput } from "src/components/inputs/SelectInput"
import { TextInput } from "src/components/inputs/TextInput"
import { Icons } from "src/constants/icons.js"
import { appletComponentService } from "src/services/applet-component-service.js"

interface State {
  component: string
  label: string
}

interface PipelineModalInputOutputProps {
  type: "input" | "output"
  label: string
  component: string
  onClickSave: (state: State) => void
}

export const PipelineModalInputOutput = NiceModal.create((props: PipelineModalInputOutputProps) => {
  const { label, type, component, onClickSave } = props
  const modal = useModal()
  const [state, setState] = useState<State>(() => ({ component, label }))

  const components = type === "input" ? appletComponentService.listOfInputs : appletComponentService.listOfOutputs
  const title = type === "input" ? "Input" : "Output"

  const handleClickBackground: MouseEventHandler = (event) => {
    event.stopPropagation()
    modal.remove()
  }

  const handleClickSave = () => {
    onClickSave(state)
    modal.remove()
  }

  return (
    <div className="DialogRoot">
      <div className="DialogOverlay" onClick={handleClickBackground}></div>
      <div className="Dialog">
        <div className="Dialog-header">
          <div className="Dialog-header-title">
            {title}
          </div>
          <div className="Dialog-header-action">
            <ButtonIcon
              icon={Icons.Close}
              tooltip="Close"
              onClick={handleClickBackground}
            />
          </div>
        </div>

        <div className="Dialog-body">
          <SelectInput
            label="Component"
            fieldKey=""
            defaultValue={state.component}
            options={components.map((value) => ({ label: value, value }))}
            onValueChange={(component) => { setState((e) => ({ ...e, component })) }}
          />
          <TextInput
            label="Label"
            fieldKey="label"
            defaultValue={state.label}
            onValueChange={(label) => { setState((e) => ({ ...e, label })) }}
          />
          <div style={{ marginTop: 20 }}>
            <Button onClick={handleClickSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
