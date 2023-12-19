import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { AutoSaveDelay } from "src/components/settings/AutoSaveDelay"
import { MaxHistoryInput } from "src/components/settings/MaxHistoryInput"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"

import "./SettingsSidebar.scss"

import { SidebarMode } from "src/components/settings/SidebarMode"

export const SettingsSidebar: FC = () => {
  return (
    <div className="SettingsSidebar">
      <div className="section">
        <div className="section-title">Appearance</div>
        <div className="section-list">
          <div className="item">
            Theme
            <SelectInput
              options={[
                { label: "Dark", value: "dark" },
                { label: "Light", value: "light" }
              ]}
              onSubmit={() => {
              }}
              initialValue="on-change"
            />
          </div>
          <div className="item">
            Sidebar Always Floating
            <SidebarMode/>
          </div>
          <div className="item">
            Text Area Word Wrap
            <TextAreaWordWrapSwitch/>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Tool</div>
        <div className="section-list">
          <div className="item">
            Run Mode
            <SelectInput
              options={[
                { label: "Manual", value: "manual" },
                { label: "On Blur", value: "on blur" },
                { label: "On Change", value: "on-change" }
              ]}
              onSubmit={() => {}}
              initialValue="on-change"
            />
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
    </div>
  )
}
