import { useModal } from "@ebay/nice-modal-react"
import { type ReactNode, type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"

interface DialogBodyProps {
  children: ReactNode
}

export const DialogHeader: FC<DialogBodyProps> = (props) => {
  const modal = useModal()
  const { children } = props

  const handleClickClose = () => {
    void modal.hide()
  }

  return (
    <div className="Dialog-header">
      <div className="Dialog-header-title">
        {children}
      </div>
      <div className="Dialog-header-action">
        <ButtonIcon
          icon={Icons.Close}
          tooltip="Close"
          onClick={handleClickClose}
        />
      </div>
    </div>
  )
}
