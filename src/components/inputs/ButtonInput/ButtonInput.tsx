import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./ButtonInput.scss"

interface ButtonInputProps extends InputComponentProps { }

export const ButtonInput: FC<ButtonInputProps> = (props) => {
  const isActionRunning = useSelector(() => toolRunnerStore.getActiveTool().isActionRunning)
  const { label } = props

  const onClickButton = () => {
    if (!isActionRunning) {
      toolRunnerStore.runActiveTool()
    }
  }

  return (
    <div className="ButtonInput">
      <Button
        type="submit"
        icon={icons.Refresh}
        onClick={onClickButton}
        disabled={isActionRunning}
      >
        {label} {isActionRunning ? "..." : ""}
      </Button>
    </div>
  )
}
