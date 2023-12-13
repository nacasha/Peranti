import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { TextAreaWordWrapSwitch } from "src/components/settings/TextAreaWordWrapSwitch"

import "./SettingsSidebar.scss"

export const SettingsSidebar: FC = () => {
  return (
    <div className="SettingsSidebar">
      <div className="section">
        <div className="section-title">General</div>
        <div className="section-list">
          <div className="item">
            Theme
          </div>
          <div className="item">Font Size</div>
          <div className="item">Zoom</div>
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
          <div className="item">
            Text Area Word Wrap
            <TextAreaWordWrapSwitch />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">History</div>
        <div className="section-list">
          <div className="item">Max History</div>
        </div>
      </div>
    </div>
  )
}
