import { Icons } from "src/constants/icons"
import { openLink } from "src/utils/open-link"

export const StatusbarItemSendFeedback = () => {
  const handleClick = () => {
    void openLink("https://github.com/nacasha/Peranti/issues")
  }

  return (
    <div className="Statusbar-item" onClick={handleClick}>
      <img src={Icons.Feedback} alt="Send Feedback" />
      Send Feedback
    </div>
  )
}
