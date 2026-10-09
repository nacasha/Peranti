import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { type FormEvent, useState } from "react"

import { Button } from "src/components/common/Button"
import { Checkbox } from "src/components/common/Checkbox"
import { Input } from "src/components/common/Input"

import { Dialog } from "../Dialog.tsx"

import "./AddSnippetDialog.scss"

interface AddSnippetDialogProps {
  onSave: (name: string, includeOptions: boolean) => void
}

export const AddSnippetDialog = NiceModal.create(({ onSave }: AddSnippetDialogProps) => {
  const modal = useModal()
  const [name, setName] = useState("")
  const [includeOptions, setIncludeOptions] = useState(false)
  const trimmedName = name.trim()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmedName) return
    onSave(trimmedName, includeOptions)
    void modal.hide()
  }

  return (
    <Dialog maxWidth={420}>
      <Dialog.Header>Add snippet</Dialog.Header>
      <form onSubmit={handleSubmit}>
        <Dialog.Content>
          <div className="AddSnippetDialog">
            <label className="AddSnippetDialog-label" htmlFor="snippet-name">Name</label>
            <Input
              id="snippet-name"
              placeholder="Snippet name"
              value={name}
              autoFocus
              onChange={(event) => { setName(event.target.value) }}
            />
            <Checkbox
              label="Include options"
              value={includeOptions}
              onChange={setIncludeOptions}
            />
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Button type="button" onClick={() => { void modal.hide() }}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!trimmedName}>Save</Button>
        </Dialog.Footer>
      </form>
    </Dialog>
  )
})
