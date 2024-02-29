import { useModal } from "@ebay/nice-modal-react"
import clsx from "clsx"
import { type FC, type ReactNode, Children, isValidElement, useEffect } from "react"

import { usePreviousValue } from "src/hooks/usePreviousValue.js"

import { DialogContent } from "./DialogContent.js"
import { DialogFooter } from "./DialogFooter.js"
import { DialogHeader } from "./DialogHeader.js"

import "./Dialog.scss"

import { useHotkeysModified } from "src/hooks/useHotkeysModified.js"

interface DialogSlots {
  Header: typeof DialogHeader
  Content: typeof DialogContent
  Footer: typeof DialogFooter
}

interface DialogProps {
  children?: ReactNode
  maxWidth?: number
}

const Dialog: DialogSlots & FC<DialogProps> = (props) => {
  const modal = useModal()
  const previousVisible = usePreviousValue(modal.visible)
  const { children, maxWidth = 400 } = props

  let header
  let footer
  const content: ReactNode[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type === DialogHeader) {
      header = child
    } else if (child.type === DialogFooter) {
      footer = child
    } else {
      content.push(child)
    }
  })

  const handleClickBackground = () => {
    void modal.hide()
  }

  useEffect(() => {
    if (previousVisible && !modal.visible) {
      setTimeout(() => {
        modal.remove()
      }, 100)
    }
  }, [modal.visible])

  useHotkeysModified("esc", (event) => {
    event.preventDefault()
    handleClickBackground()
  })

  return (
    <div className={clsx("DialogRoot", { show: modal.visible })}>
      <div className="DialogOverlay" onClick={handleClickBackground}></div>
      <div className={clsx("Dialog", { show: modal.visible })} style={{ maxWidth }}>
        {!!header && header}
        {content}
        {!!footer && footer}
      </div>
    </div>
  )
}

Dialog.Header = DialogHeader
Dialog.Content = DialogContent
Dialog.Footer = DialogFooter

export { Dialog }
