import localforage from "localforage"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { SidebarMode } from "src/components/settings/SidebarMode"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"

import "./SettingsPage.scss"

export const SettingsPage: FC = () => {
  const handleClickResetAppData = () => {
    localStorage.clear()

    void localforage.clear().then(() => {
      window.document.location.reload()
    })
  }

  return (
    <div className="SettingsPage">
      <SettingsCard title="Appearance">
        <SettingsCardItem label="Theme">
          <ThemeSelect />
        </SettingsCardItem>

        <SettingsCardItem label="Floating Sidebar">
          <SidebarMode />
        </SettingsCardItem>

        <SettingsCardItem label="Text Area Word Wrap">
          <TextAreaWordWrapSwitch />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="App Data">
        <SettingsCardItem label="Extensions">
          <Button>Show Folder</Button>
        </SettingsCardItem>

        <SettingsCardItem label="Settings JSON File">
          <Button>Show File</Button>
        </SettingsCardItem>

        <SettingsCardItem label="Reset">
          <div
            className="SettingsPage-item-value"
            onClick={handleClickResetAppData}
          >
            <Button>Reset App Data</Button>
          </div>
        </SettingsCardItem>
      </SettingsCard>
    </div>
  )
}
