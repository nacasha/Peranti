import NiceModal from "@ebay/nice-modal-react"
import { clsx } from "clsx"
import localforage from "localforage"
import { useState, type FC, type ReactNode } from "react"
import SimpleBar from "simplebar-react"

import { Button } from "src/components/common/Button"
import { ConfirmDialog } from "src/components/dialog/ConfirmDialog"
import { AccentColorPicker } from "src/components/settings/AccentColorPicker"
import { AppTitleBarStyleSelect } from "src/components/settings/AppTitlebarStyleSelect"
import { CardShadowSelect } from "src/components/settings/CardShadowSelect"
import { CornerRadiusSelect } from "src/components/settings/CornerRadiusSelect"
import { FileDropActionSelect } from "src/components/settings/FileDropActionSelect"
import { FileDropFillTabbarName } from "src/components/settings/FileDropFillTabbarName"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { SettingsHistory } from "src/components/settings/SettingsHistory"
import { SettingsItemInput } from "src/components/settings/SettingsItemInput"
import { SettingsItemSwitch } from "src/components/settings/SettingsItemSwitch"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"
import { ToolSidebarDensitySelect } from "src/components/settings/ToolSidebarDensitySelect"
import { Icons, type Icon } from "src/constants/icons"
import { appDataService } from "src/services/app-data-service"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { toolSidebarService } from "src/services/tool-sidebar-service"

import "./SettingsPage.scss"

type SettingsSectionId = "appearance" | "fonts" | "tabbar" | "toolSidebar" | "fileDrop" | "history" | "appData"

interface SettingsSection {
  id: SettingsSectionId
  label: string
  icon: Icon
  content: ReactNode
}

/**
 * Settings as one card filling the whole area, like the history page: the
 * categories on the left, the chosen category's settings on the right
 */
export const SettingsPage: FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<SettingsSectionId>("appearance")

  const handleClickResetAppData = () => {
    void NiceModal.show(ConfirmDialog, {
      title: "Reset App Data",
      description: "This action will clear data related to application state, your settings will not be touched",
      confirmLabel: "Reset",
      variant: "danger",
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

  const sections: SettingsSection[] = [
    {
      id: "appearance",
      label: "Appearance",
      icon: Icons.Palette,
      content: (
        <SettingsCard>
          <SettingsCardItem label="Theme">
            <ThemeSelect />
          </SettingsCardItem>

          <SettingsCardItem
            label="Accent Color"
            description="Highlights, active items and focus rings"
          >
            <AccentColorPicker />
          </SettingsCardItem>

          <SettingsCardItem label="Title Bar Style">
            <AppTitleBarStyleSelect />
          </SettingsCardItem>

          <SettingsCardItem label="Text Area Word Wrap">
            <TextAreaWordWrapSwitch />
          </SettingsCardItem>

          <SettingsCardItem
            label="Show Status Bar"
            description="Version, theme and word wrap shortcuts along the bottom"
          >
            <SettingsItemSwitch
              defaultChecked={interfaceStore.showStatusbar}
              onChange={(value) => { interfaceStore.setShowStatusbar(value) }}
            />
          </SettingsCardItem>

          <SettingsCardItem
            label="Corner Radius"
            description="Roundness of cards, tabs, buttons and menus"
          >
            <CornerRadiusSelect />
          </SettingsCardItem>

          <SettingsCardItem
            label="Card Shadow"
            description="Drop shadow under input, output and sidebar cards"
          >
            <CardShadowSelect />
          </SettingsCardItem>
        </SettingsCard>
      )
    },
    {
      id: "fonts",
      label: "Fonts",
      icon: Icons.Type,
      content: (
        <SettingsCard>
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
      )
    },
    {
      id: "tabbar",
      label: "Tabbar",
      icon: Icons.PanelTop,
      content: (
        <SettingsCard>
          <SettingsCardItem
            label="Separate Tabbar For Each Tool"
            description="Enabling this will only shows tabbars related to active tool"
          >
            <SettingsItemSwitch
              defaultChecked={sessionStore.groupTabsByTool}
              onChange={(value) => { sessionStore.setGroupTabsByTool(value) }}
            />
          </SettingsCardItem>

          <SettingsCardItem
            label="Show Group Tabs Button"
            description="Filter icon in the tabbar that groups tabs by tool"
          >
            <SettingsItemSwitch
              defaultChecked={interfaceStore.showTabbarGroupTabsButton}
              onChange={(value) => { interfaceStore.setShowTabbarGroupTabsButton(value) }}
            />
          </SettingsCardItem>

          <SettingsCardItem
            label="Show Add Tab Button"
            description="Plus icon in the tabbar that opens a new tab"
          >
            <SettingsItemSwitch
              defaultChecked={interfaceStore.showTabbarAddTabButton}
              onChange={(value) => { interfaceStore.setShowTabbarAddTabButton(value) }}
            />
          </SettingsCardItem>
        </SettingsCard>
      )
    },
    {
      id: "toolSidebar",
      label: "Tool Sidebar",
      icon: Icons.PanelLeft,
      content: (
        <SettingsCard>
          <SettingsCardItem label="Group By Category">
            <SettingsItemSwitch
              defaultChecked={toolSidebarService.groupByCategory}
              onChange={(value) => { toolSidebarService.setGroupByCategory(value) }}
            />
          </SettingsCardItem>

          <SettingsCardItem
            label="Item Density"
            description="Vertical spacing of the tool list items and category headers"
          >
            <ToolSidebarDensitySelect />
          </SettingsCardItem>
        </SettingsCard>
      )
    },
    {
      id: "fileDrop",
      label: "File Drop",
      icon: Icons.Upload,
      content: (
        <SettingsCard>
          <SettingsCardItem label="Action">
            <FileDropActionSelect />
          </SettingsCardItem>

          <SettingsCardItem label="Dropped File Replace Tabbar Name">
            <FileDropFillTabbarName />
          </SettingsCardItem>
        </SettingsCard>
      )
    },
    {
      id: "history",
      label: "History",
      icon: Icons.History,
      content: <SettingsHistory />
    },
    {
      id: "appData",
      label: "Application Data",
      icon: Icons.Database,
      content: (
        <SettingsCard>
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
      )
    }
  ]

  const activeSection = sections.find((section) => section.id === activeSectionId)

  return (
    <div className="SettingsPage">
      <div className="SettingsPage-header">
        <span className="SettingsPage-title">Settings</span>
      </div>

      <div className="SettingsPage-layout">
        <nav className="SettingsPage-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={clsx("SettingsPage-nav-item", section.id === activeSectionId && "active")}
              onClick={() => { setActiveSectionId(section.id) }}
            >
              <section.icon size={14} aria-hidden />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="SettingsPage-body">
          <SimpleBar className="SettingsPage-scroll">
            <div className="SettingsPage-section">
              <div className="SettingsPage-section-title">{activeSection?.label}</div>
              {activeSection?.content}
            </div>
          </SimpleBar>
        </div>
      </div>
    </div>
  )
}
