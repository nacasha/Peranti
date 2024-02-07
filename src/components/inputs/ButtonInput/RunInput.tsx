import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./RunInput.scss"

interface RunInputProps extends InputComponentProps { }

export const RunInput: FC<RunInputProps> = (props) => {
  const isActionRunning = useSelector(() => activeAppletStore.getActiveApplet().isActionRunning)
  const { label } = props

  const onClickButton = () => {
    if (!isActionRunning) {
      activeAppletStore.run()
    }
  }

  return (
    <div className="RunInput">
      <Button
        type="submit"
        icon={Icons.Refresh}
        onClick={onClickButton}
        disabled={isActionRunning}
      >
        {label} {isActionRunning ? "..." : ""}
      </Button>
    </div>
  )
}
