import { type FC } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

interface ImageOutputProps extends OutputComponentProps<string> {
  width?: number
}

export const ImageOutput: FC<ImageOutputProps> = (props) => {
  const { output = "", width } = props

  return (
    <img src={output} width={width} />
  )
}
