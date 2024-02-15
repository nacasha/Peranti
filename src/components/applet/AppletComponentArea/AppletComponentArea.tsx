import { type FC } from "react"

import { AppletContextMenu } from "../AppletContextMenu/index.ts"

import { AppletComponentAreaBody } from "./AppletComponentAreaBody.tsx"
import { AppletComponentAreaContainer } from "./AppletComponentAreaContainer.tsx"

import "./AppletComponentArea.scss"

export const AppletComponentArea: FC = () => {
  return (
    <AppletComponentAreaContainer>
      <AppletContextMenu />
      <AppletComponentAreaBody />
    </AppletComponentAreaContainer>
  )
}
