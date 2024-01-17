import { type FC } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

export const BinaryOutput: FC<OutputComponentProps> = (props) => {
  const { output = "" } = props

  if (!output) {
    return null
  }

  if (output.trim().length === 0) {
    return null
  }

  const base64 = "data:image/jpeg;base64," + btoa(encodeURIComponent(output))

  return (
    <img src={base64} />
  )
}
