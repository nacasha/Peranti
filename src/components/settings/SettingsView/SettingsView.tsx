import localforage from "localforage"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { AppTitleBarStyleSelect } from "src/components/settings/AppTitlebarStyleSelect"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { SidebarMode } from "src/components/settings/SidebarMode"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"

import { FileDropActionSelect } from "../FileDropActionSelect"
import { FileDropFillTabbarName } from "../FileDropFillTabbarName"

import "./SettingsView.scss"

export const SettingsView: FC = () => {
  const handleClickResetAppData = () => {
    localStorage.clear()

    void localforage.clear().then(() => {
      window.document.location.reload()
    })
  }

  return (
    <div className="SettingsView">
      <SettingsCard title="Appearance">
        <SettingsCardItem label="Theme">
          <ThemeSelect />
        </SettingsCardItem>

        <SettingsCardItem label="Title Bar Style">
          <AppTitleBarStyleSelect />
        </SettingsCardItem>

        <SettingsCardItem label="Floating Sidebar">
          <SidebarMode />
        </SettingsCardItem>

        <SettingsCardItem label="Text Area Word Wrap">
          <TextAreaWordWrapSwitch />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="File Drop">
        <SettingsCardItem label="Action">
          <FileDropActionSelect />
        </SettingsCardItem>
        <SettingsCardItem label="Dropped File Replace Tabbar Name">
          <FileDropFillTabbarName />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Application Data">
        <SettingsCardItem label="App Data Folder">
          <Button>Open Folder</Button>
        </SettingsCardItem>

        <SettingsCardItem label="Settings JSON File">
          <Button>Show File</Button>
        </SettingsCardItem>

        <SettingsCardItem
          label="App Data"
          description="Data related to opened sessions, closed editors, and application state"
        >
          <div
            className="SettingsView-item-value"
            onClick={handleClickResetAppData}
          >
            <Button>Reset App Data</Button>
          </div>
        </SettingsCardItem>

        <SettingsCardItem
          label="User Settings"
          description="Data related to user customization for application"
        >
          <div
            className="SettingsView-item-value"
            onClick={handleClickResetAppData}
          >
            <Button>Reset User Settings</Button>
          </div>
        </SettingsCardItem>
      </SettingsCard>
    </div>
  )
}
