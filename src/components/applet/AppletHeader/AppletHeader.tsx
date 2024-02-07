import { AppletSampleButton } from "src/components/buttons/AppletSampleButton"
import { DeleteClosedEditorButton } from "src/components/buttons/DeleteClosedEditorButton"
import { RestoreClosedEditorButton } from "src/components/buttons/RestoreClosedEditorButton"
import { ToggleBatchModeButton } from "src/components/buttons/ToggleBatchModeButton"
import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"

import "./AppletHeader.scss"

export const AppletHeader = () => {
  return (
    <div className="AppletHeader">
      <div className="AppletHeader-button-list">
        <AppletSampleButton />
        <ToggleBatchModeButton />

        <DeleteClosedEditorButton />
        <RestoreClosedEditorButton />
      </div>

      <div className="AppletHeader-button-list">
        <Button icon={Icons.Settings}>
          Settings
        </Button>
      </div>
    </div>
  )
}
