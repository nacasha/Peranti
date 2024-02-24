// import { AppletSampleButton } from "src/components/buttons/AppletSampleButton"
// import { DeleteClosedEditorButton } from "src/components/buttons/DeleteClosedEditorButton"
// import { RestoreClosedEditorButton } from "src/components/buttons/RestoreClosedEditorButton"
// import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
// import { appletSidebarService } from "src/services/applet-sidebar-service"

import "./AppletHeader.scss"

export const AppletHeader = () => {
  // const handleClickSettings = () => {
  //   appletSidebarService.toggle()
  // }

  return (
    <div className="AppletHeader">
      <div className="AppletHeader-inner">
        <div className="AppletHeader-button-list">
          <ButtonIcon icon={Icons.Run} />
          <ButtonIcon icon={Icons.Plus} />
          <ButtonIcon icon={Icons.FullScreen} />
          {/* <Button icon={Icons.Settings} onClick={handleClickSettings}>
            Options
          </Button>
          <AppletSampleButton />
          <DeleteClosedEditorButton />
          <RestoreClosedEditorButton /> */}
        </div>

        <div className="AppletHeader-button-list">
          {/* <Button icon={Icons.Settings} onClick={handleClickSettings}>
            Options
          </Button> */}
        </div>
      </div>
    </div>
  )
}
