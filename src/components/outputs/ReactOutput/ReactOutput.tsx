import { type FC } from "react"
import { Runner } from "react-runner"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import { reactOutputClasses } from "./ReactOutput.css"

interface ReactOutputProps extends OutputComponentProps {}

export const ReactOutput: FC<ReactOutputProps> = (props) => {
  const { label, value } = props

  return (
    <div className={reactOutputClasses.root}>
      <ComponentLabel label={label} />
      <div className={reactOutputClasses.outputArea}>
        <Runner code={value} />
      </div>
    </div>
  )
}
