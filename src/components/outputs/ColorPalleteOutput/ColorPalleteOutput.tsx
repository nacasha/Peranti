import clsx from "clsx"
import { colord } from "colord"
import { useState, type FC, useEffect } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ColorPalleteOutput.scss"

interface ColorPalleteOutputProps extends OutputComponentProps {
  showInfo?: boolean
  singleColor?: boolean
}

export const ColorPalleteOutput: FC<ColorPalleteOutputProps> = (props) => {
  const { fieldKey, label, showInfo, singleColor, value = [] } = props
  const [colorPallete, setColorPallete] = useState<string[]>([])

  useEffect(() => {
    try {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setColorPallete(["transparent"])
      } else {
        if (singleColor && typeof value === "string") {
          setColorPallete([value])
        } else if (Array.isArray(value)) {
          setColorPallete(value)
        } else {
          setColorPallete(JSON.parse(value))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [value])

  return (
    <div className="ColorPalleteOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className={clsx("ColorPalleteOutput-content", { singleColor })}>
        {colorPallete.map((color) => (
          <div key={color} className="ColorPalleteOutput-item">
            <div className="ColorPalleteOutput-color">
              <div
                className="ColorPalleteOutput-pallete"
                style={{ backgroundColor: color }}
              />
            </div>
            {showInfo && (
              <div className="ColorPalleteOutput-info">
                {colord(color).toHex()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
