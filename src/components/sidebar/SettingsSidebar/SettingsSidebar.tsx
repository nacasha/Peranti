import localforage from "localforage"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { AutoSaveDelay } from "src/components/settings/AutoSaveDelay"
import { MaxHistoryInput } from "src/components/settings/MaxHistoryInput"
import { SidebarMode } from "src/components/settings/SidebarMode"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"
import { ThemeSelect } from "src/components/settings/ThemeSelect"

import "./SettingsSidebar.scss"

export const SettingsSidebar: FC = () => {
  const onClickLocalStorage = () => {
    localStorage.clear()

    void localforage.clear().then(() => {
      window.document.location.reload()
    })
  }

  return (
    <div className="SettingsSidebar">
      <div className="AppSidebarContent-title">Settings</div>
      <div className="section">
        <div className="section-title">Appearance</div>
        <div className="section-list">
          <div className="item">
            Theme
            <ThemeSelect />
          </div>
          <div className="item">
            Sidebar Floating
            <SidebarMode />
          </div>
          <div className="item">
            Text Area Word Wrap
            <TextAreaWordWrapSwitch />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Tool</div>
        <div className="section-list">
          <div className="item">
            Restore Last Tool State
            <TextAreaWordWrapSwitch />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">History</div>
        <div className="section-list">
          <div className="item">
            Max History Entries
            <MaxHistoryInput />
          </div>

          <div className="item">
            Auto Save Delay
            <AutoSaveDelay />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Storage</div>
        <div className="section-list">
          <div className="item">
            <Button onClick={onClickLocalStorage}>
              Reset Tool
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
