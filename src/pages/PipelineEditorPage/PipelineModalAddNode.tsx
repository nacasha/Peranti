import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { type MouseEventHandler } from "react"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons.js"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { toolSidebarService } from "src/services/tool-sidebar-service"

interface PipelineModalInputOutputProps {
  onSelectTool: (appletConstructor: AppletConstructor) => void
}

export const PipelineModalAddNode = NiceModal.create((props: PipelineModalInputOutputProps) => {
  const { onSelectTool } = props
  const modal = useModal()

  const mapOfCategoryAndTools = toolSidebarService.items

  const handleClickBackground: MouseEventHandler = () => {
    modal.remove()
  }

  const handleClickItem = (tool: AppletConstructor) => {
    onSelectTool(tool)
    modal.remove()
  }

  return (
    <div className="DialogRoot">
      <div className="DialogOverlay" onClick={handleClickBackground}></div>
      <div className="Dialog" style={{ maxWidth: 800 }}>
        <div className="Dialog-header">
          <div className="Dialog-header-title">
            Add Node
          </div>
          <div className="Dialog-header-action">
            <ButtonIcon
              icon={Icons.Close}
              tooltip="Close"
              onClick={handleClickBackground}
            />
          </div>
        </div>

        <div className="Dialog-body">
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
        </div>
      </div>
    </div>
  )
})
