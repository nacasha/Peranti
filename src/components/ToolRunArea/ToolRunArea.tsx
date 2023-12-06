import { FC } from "react";
import { AreaInput } from "../AreaInput";
import { AreaOutput } from "../AreaOutput";

import "./ToolRunArea.scss"
import { rootStore } from "../../store/root-store";

export const ToolRunArea: FC = () => {
  const { layout = "side-by-side" } = rootStore.tool.use.currentToolOrEmpty()

  return (
    <div className={`ToolRunArea ${layout}`}>
      <AreaInput />
      <AreaOutput />
    </div>
  )
}
