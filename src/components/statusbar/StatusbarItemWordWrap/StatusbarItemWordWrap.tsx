import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const StatusbarItemWordWrap = () => {
  const isWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)
  const label = isWordWrap ? "On" : "Off"

  const handleClick = () => {
    interfaceStore.toggleTextAreaWordWrap()
  }

  return (
    <div className="Statusbar-item" onClick={handleClick}>
      <Icons.WordWrap size={12} aria-hidden />
      Word Wrap: {label}
    </div>
  )
}
