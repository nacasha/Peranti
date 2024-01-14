import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./ButtonInput.scss"

interface ButtonInputProps extends InputComponentProps { }

export const ButtonInput: FC<ButtonInputProps> = (props) => {
  const { label } = props

  const onClickButton = () => {
    toolRunnerStore.runActiveTool()
  }

  return (
    <div className="ButtonInput">
      <Button icon={assets.RefreshSVG} onClick={onClickButton}>
        {label}
      </Button>
    </div>
  )
}
