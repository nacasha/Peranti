import { FC } from "react";
import { AreaInput } from "../AreaInput";
import { AreaOutput } from "../AreaOutput";

export const ToolRunArea: FC = () => {
  return (
    <div className="ToolRunArea horizontal">
      <AreaInput />
      <AreaOutput />
    </div>
  )
}
