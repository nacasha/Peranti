import { Icons } from "src/constants/icons"
import { openLink } from "src/utils/open-link"

export const StatusbarItemSendFeedback = () => {
  const handleClick = () => {
    void openLink("https://github.com/nacasha/Peranti/issues")
  }

  return (
    <div className="Statusbar-item" onClick={handleClick}>
      <Icons.Feedback size={12} aria-hidden />
      Send Feedback
    </div>
  )
}
