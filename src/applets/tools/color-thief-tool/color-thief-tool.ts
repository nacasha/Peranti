import ColorThief from "colorthief"

import { AppletConstructor } from "src/models/AppletConstructor"

export const colorThiefTool = new AppletConstructor({
  appletId: "color-thief",
  name: "Color Thief",
  description: "Extract / Grab the color palette from an image",
  category: "Color",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' 1fr"
  },
  inputFields: [
    {
      key: "file",
      label: "Image",
      component: "File",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "color",
      label: "Dominant Color",
      component: "ColorPallete",
      props: {
        showInfo: true,
        singleColor: true
      }
    },
    {
      key: "palletes",
      label: "Palletes",
      component: "ColorPallete",
      props: {
        showInfo: true
      }
    }
  ],
  options: [
    {
      key: "palleteCount",
      label: "Pallete Count",
      component: "Text",
      defaultValue: "5",
      props: {
        type: "number"
      }
    }
  ],
  action: async({ inputValues, options }) => {
    const { file } = inputValues
    const { palleteCount = 5 } = options

    if (!file) {
      return { color: "", palletes: [] }
    }

    const colorThief = new ColorThief()
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => {
        resolve()
      }
      img.src = URL.createObjectURL(file)
    })

    const color = colorThief.getColor(img)
    const colorRgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    const palletes = colorThief.getPalette(img, Number(palleteCount)).map((colorArray: number[]) => (
      `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`
    ))

    return { color: colorRgb, palletes }
  }
})
