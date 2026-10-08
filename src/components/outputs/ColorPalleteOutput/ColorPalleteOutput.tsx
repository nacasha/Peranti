import clsx from "clsx"
import { colord, extend } from "colord"
import a11yPlugin from "colord/plugins/a11y"
import { useState, type FC, useEffect, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"
import { ClipboardService } from "src/services/clipboard-service"
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => { clearTimeout(copiedTimeoutRef.current) }, [])

  const handleClickColor = async(index: number, color: string) => {
    await ClipboardService.copyAsText(colord(color).toHex())

    clearTimeout(copiedTimeoutRef.current)
    setCopiedIndex(index)
    copiedTimeoutRef.current = setTimeout(() => { setCopiedIndex(null) }, 1500)
  }

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
            <button
              className="ColorPalleteOutput-color"
              aria-label={`Copy ${colord(color).toHex()}`}
              onClick={() => { void handleClickColor(index, color) }}
            >
              <div
                className="ColorPalleteOutput-pallete"
                style={{ backgroundColor: color }}
              />
              {copiedIndex === index && (
                <Icons.CopyDone className="ColorPalleteOutput-check" size={18} aria-hidden />
              )}
            </button>
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
