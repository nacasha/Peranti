import { type FC } from "react"

import { Button } from "src/components/common/Button"

export const PipelineEditorButtons: FC = () => {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Button>Save</Button>
      <Button>Run</Button>
    </div>
  )
}
