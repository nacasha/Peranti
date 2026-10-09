import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { type FormEvent, useState } from "react"

import { Button } from "src/components/common/Button"
import { Input } from "src/components/common/Input"

import { Dialog } from "../Dialog.tsx"

import "./AddSnippetDialog.scss"

interface AddSnippetDialogProps {
  onSave: (name: string) => void
}

export const AddSnippetDialog = NiceModal.create(({ onSave }: AddSnippetDialogProps) => {
  const modal = useModal()
  const [name, setName] = useState("")
  const trimmedName = name.trim()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmedName) return
    onSave(trimmedName)
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
