import { type FC } from "react"

import "./IFrameOutput.scss"

export const IFrameOutput: FC = () => {
  return (
    <iframe
      src="https://jsoncrack.com/editor"
      className="IFrameOutput"
      style={{ flex: 1, display: "block", position: "relative" }}
    />
  )
}
