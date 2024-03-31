import ColorPicker from "@rc-component/color-picker"
import "@rc-component/color-picker/assets/index.css"
import { type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./ColorPickerInput.scss"

export const toHexFormat = (value?: string) =>
  value?.replace(/[^0-9a-fA-F#]/g, "").slice(0, 9) ?? ""

interface ColorPickerInputProps extends InputComponentProps {}

export const ColorPickerInput: FC<ColorPickerInputProps> = (props) => {
  const {
    label,
    value = "",
    onValueChange,
    readOnly,
    fieldKey
  } = props

  const onInputChange = (newValue: string) => {
    onValueChange(newValue)
  }

  return (
    <div className="ColorPickerInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <ColorPicker
        disabledAlpha
        defaultValue={value}
        disabled={readOnly}
        onChange={(color) => { onInputChange(color.toHexString()) }}
        panelRender={(panel) => (
          <>
            {panel}
            <input
              value={value}
              onChange={e => {
                const originValue = e.target.value
                onInputChange(toHexFormat(originValue))
              }}
            />
          </>
        )}
      />
    </div>
  )
}
