import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { useState } from "react"

import { Button } from "src/components/common/Button"
import { Dialog } from "src/components/dialog/Dialog.tsx"
import { SelectInput } from "src/components/inputs/SelectInput"
import { TextInput } from "src/components/inputs/TextInput"
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

  const handleClickSave = () => {
    onClickSave(state)
    void modal.hide()
  }

  return (
    <Dialog>
      <Dialog.Header>{title}</Dialog.Header>
      <Dialog.Content>
        <SelectInput
          label="Component"
          fieldKey=""
          value={state.component}
          options={components.map((value) => ({ label: value, value }))}
          onValueChange={(component) => { setState((e) => ({ ...e, component })) }}
        />
        <TextInput
          label="Label"
          fieldKey="label"
          value={state.label}
          onValueChange={(label) => { setState((e) => ({ ...e, label })) }}
        />
      </Dialog.Content>

      <Dialog.Footer>
        <Button onClick={handleClickSave}>
              Save
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
})
