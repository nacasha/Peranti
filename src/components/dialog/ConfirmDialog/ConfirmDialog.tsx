import NiceModal, { useModal } from "@ebay/nice-modal-react"

import { Button } from "src/components/common/Button"

import { Dialog } from "../Dialog.tsx"

import "./ConfirmDialog.scss"

interface ConfirmDialogProps {
  title: string
  description?: string
  onConfirm: () => void
  confirmKeepOpen?: boolean
  confirmLabel?: string
  cancelLabel?: string
  /**
   * "danger" paints the confirm button red, for actions that remove data
   */
  variant?: "primary" | "danger"
}

export const ConfirmDialog = NiceModal.create((props: ConfirmDialogProps) => {
  const {
    onConfirm,
    title,
    description,
    confirmKeepOpen,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "primary"
  } = props
  const modal = useModal()

  const handleConfirm = () => {
    onConfirm()
    if (!confirmKeepOpen) {
      void modal.hide()
    }
  }

  const handleCancel = () => {
    void modal.hide()
  }

  return (
    <Dialog maxWidth={420}>
      <Dialog.Content>
        <div className="ConfirmDialog">
          <div className="ConfirmDialog-title">{title}</div>
          {description && (
            <div className="ConfirmDialog-description">{description}</div>
          )}
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Button onClick={handleCancel}>{cancelLabel}</Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
})
