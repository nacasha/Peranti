import NiceModal, { useModal } from "@ebay/nice-modal-react"

import { Button } from "src/components/common/Button"

import { Dialog } from "../Dialog.tsx"

interface ConfirmDialogProps {
  title: string
  description?: string
  onConfirm: () => void
}

export const ConfirmDialog = NiceModal.create((props: ConfirmDialogProps) => {
  const { onConfirm, title, description } = props
  const modal = useModal()

  const handleConfirm = () => {
    onConfirm()
    void modal.hide()
  }

  return (
    <Dialog>
      <Dialog.Header>{title}</Dialog.Header>
      <Dialog.Content>
        {description}
      </Dialog.Content>
      <Dialog.Footer>
        <Button onClick={handleConfirm}>Confirm</Button>
      </Dialog.Footer>
    </Dialog>
  )
})
