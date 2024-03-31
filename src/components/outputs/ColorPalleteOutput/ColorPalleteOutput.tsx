import clsx from "clsx"
import { colord, extend } from "colord"
import a11yPlugin from "colord/plugins/a11y"
import { useState, type FC, useEffect } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ColorPalleteOutput.scss"

extend([a11yPlugin])

interface ColorPalleteOutputProps extends OutputComponentProps {
  showInfo?: boolean
  singleColor?: boolean
}

export const ColorPalleteOutput: FC<ColorPalleteOutputProps> = (props) => {
  const { fieldKey, label, showInfo, singleColor, value = [] } = props
  const [colorPallete, setColorPallete] = useState<string[]>([])

  const getTextColor = (color: string) => {
    const contrastValue = colord("#000").contrast(color)
    if (contrastValue > 10.5) {
      return "#000"
    }
    return "#fff"
  }

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
        {colorPallete.map((color, index) => (
          <div key={index.toString()} className="ColorPalleteOutput-item">
            <div className="ColorPalleteOutput-color">
              <div
                className="ColorPalleteOutput-pallete"
                style={{ backgroundColor: color }}
              />
            </div>
            {showInfo && (
              <div className="ColorPalleteOutput-info" style={{ color: getTextColor(color) }}>
                {colord(color).toHex()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
