import NiceModal, { useModal } from "@ebay/nice-modal-react"

import { Button } from "src/components/common/Button"
import { Dialog } from "src/components/dialog/Dialog.tsx"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { toolSidebarService } from "src/services/tool-sidebar-service"

interface PipelineModalInputOutputProps {
  onSelectTool: (appletConstructor: AppletConstructor) => void
}

export const PipelineModalAddNode = NiceModal.create((props: PipelineModalInputOutputProps) => {
  const { onSelectTool } = props
  const modal = useModal()

  const mapOfCategoryAndTools = toolSidebarService.items

  const handleClickItem = (tool: AppletConstructor) => {
    onSelectTool(tool)
    void modal.hide()
  }

  return (
    <Dialog maxWidth={800}>
      <Dialog.Header>
        Add Tool
      </Dialog.Header>
      <Dialog.Content>
        <div className="AddNodeModalBody">
          <div className="AddNodeModalBody-content">
            {Object.entries(mapOfCategoryAndTools).map(([category, tools]) => (
              <div key={category} className="AddNodeModalBody-section">
                <div className="AddNodeModalBody-section-header">
                  {category}
                </div>
                <div className="AddNodeModalBody-section-items">
                  {tools.map((tool) => (
                    <Button
                      key={tool.appletId}
                      className="AddNodeModalBody-section-item"
                      onClick={() => { handleClickItem(tool) }}
                    >
                      {tool.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  )
})
