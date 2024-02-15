import localforage from "localforage"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { AppTitleBarStyleSelect } from "src/components/settings/AppTitlebarStyleSelect"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { SidebarMode } from "src/components/settings/SidebarMode"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"
import { appDataService } from "src/services/app-data-service"
import { sessionStore } from "src/services/session-store"
import { toolSidebarService } from "src/services/tool-sidebar-service"

import { FileDropActionSelect } from "../FileDropActionSelect"
import { FileDropFillTabbarName } from "../FileDropFillTabbarName"
import { SettingsItemSwitch } from "../SettingsItemSwitch"

import "./SettingsView.scss"

export const SettingsView: FC = () => {
  const handleClickResetAppData = () => {
    localStorage.clear()

    void localforage.clear().then(() => {
      window.document.location.reload()
    })
  }

  const handleOpenAppDataFolder = () => {
    void appDataService.openAppDataFolder()
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

        <SettingsCardItem label="User Interface Font">
          <AppTitleBarStyleSelect />
        </SettingsCardItem>

        <SettingsCardItem
          label="Floating Sidebar"
          description="Primary sidebar will automatically hidden after opening tool"
        >
          <SidebarMode />
        </SettingsCardItem>

        <SettingsCardItem label="Text Area Word Wrap">
          <TextAreaWordWrapSwitch />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Tabbar">
        <SettingsCardItem
          label="Separate Tabbar For Each Tool"
          description="Enabling this will only shows tabbars related to active tool"
        >
          <SettingsItemSwitch
            defaultChecked={sessionStore.separateSessionForEachApplet}
            onChange={(value) => { sessionStore.setSeparateSessionForEachApplet(value) }}
          />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Tool Sidebar">
        <SettingsCardItem
          label="Sort Tool name A-Z"
        >
          <SettingsItemSwitch
            defaultChecked={toolSidebarService.sortNameAZ}
            onChange={(value) => { toolSidebarService.setSortNameAZ(value) }}
          />
        </SettingsCardItem>
        <SettingsCardItem label="Group By Category">
          <SettingsItemSwitch
            defaultChecked={toolSidebarService.groupByCategory}
            onChange={(value) => { toolSidebarService.setGroupByCategory(value) }}
          />
        </SettingsCardItem>
        <SettingsCardItem
          label="Sort Category name A-Z"
          description="No effect when Group By Category is disabled"
        >
          <SettingsItemSwitch
            defaultChecked={toolSidebarService.sortCategoryAZ}
            onChange={(value) => { toolSidebarService.setSortCategoryAZ(value) }}
          />
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
          <Button onClick={handleOpenAppDataFolder}>Open Folder</Button>
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
