import NiceModal from "@ebay/nice-modal-react"
import localforage from "localforage"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { ConfirmDialog } from "src/components/dialog/ConfirmDialog"
import { AppTitleBarStyleSelect } from "src/components/settings/AppTitlebarStyleSelect"
import { FileDropActionSelect } from "src/components/settings/FileDropActionSelect"
import { FileDropFillTabbarName } from "src/components/settings/FileDropFillTabbarName"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { SettingsItemInput } from "src/components/settings/SettingsItemInput"
import { SettingsItemSwitch } from "src/components/settings/SettingsItemSwitch"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"
import { appDataService } from "src/services/app-data-service"
import { sessionStore } from "src/services/session-store"
import { toolSidebarService } from "src/services/tool-sidebar-service"

import "./SettingsPage.scss"

import { interfaceStore } from "src/services/interface-store"

export const SettingsPage: FC = () => {
  const handleClickResetAppData = () => {
    void NiceModal.show(ConfirmDialog, {
      title: "Reset App Data",
      description: "This action will clear data related to application state, your settings will not be touched",
      confirmKeepOpen: true,
      onConfirm: () => {
        localStorage.clear()

        void localforage.clear().then(() => {
          window.document.location.reload()
        })
      }
    })
  }

  const handleOpenAppDataFolder = () => {
    void appDataService.openAppDataFolder()
  }

  return (
    <div className="SettingsPage">
      <SettingsCard title="Appearance">
        <SettingsCardItem label="Theme">
          <ThemeSelect />
        </SettingsCardItem>

        <SettingsCardItem label="Title Bar Style">
          <AppTitleBarStyleSelect />
        </SettingsCardItem>

        <SettingsCardItem label="Text Area Word Wrap">
          <TextAreaWordWrapSwitch />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Fonts">
        <SettingsCardItem label="Editor Font Family">
          <SettingsItemInput
            defaultValue={interfaceStore.editorFontFamily}
            onChange={(value) => { interfaceStore.setEditorFontFamily(value) }}
          />
        </SettingsCardItem>

        <SettingsCardItem label="Editor Font Size">
          <SettingsItemInput
            defaultValue={interfaceStore.editorFontSize}
            onChange={(value) => { interfaceStore.setEditorFontSize(value) }}
          />
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Tabbar">
        <SettingsCardItem
          label="Separate Tabbar For Each Tool"
          description="Enabling this will only shows tabbars related to active tool"
        >
          <SettingsItemSwitch
            defaultChecked={sessionStore.groupTabsByTool}
            onChange={(value) => { sessionStore.setGroupTabsByTool(value) }}
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
        <SettingsCardItem label="User Settings File">
          <Button onClick={handleOpenAppDataFolder}>Open Folder</Button>
        </SettingsCardItem>

        <SettingsCardItem
          label="App Data"
          description="Date related opened sessions, closed editors, and application state"
        >
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
