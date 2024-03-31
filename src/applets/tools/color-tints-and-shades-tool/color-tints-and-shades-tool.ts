import Values from "values.js"

import { AppletConstructor } from "src/models/AppletConstructor"

export const colorTintsAndShadesTool = new AppletConstructor({
  appletId: "color-tints-and-shades",
  name: "Tints And Shades Generator",
  description: "Generate color tints and shades from base color",
  category: "Color",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' 1fr"
  },
  inputFields: [
    {
      key: "color",
      label: "Color",
      component: "ColorPicker",
      defaultValue: "#ffffff"
    }
  ],
  outputFields: [
    {
      key: "tints",
      label: "Tints",
      component: "ColorPallete",
      props: {
        showInfo: true
      }
    },
    {
      key: "shades",
      label: "Shades",
      component: "ColorPallete",
      props: {
        showInfo: true
      }
    }
  ],
  action: async({ inputValues }) => {
    const { color } = inputValues

    try {
      const colorValues = new Values(color)

      const tints = colorValues.tints(10).map((value) => value.rgbString())
      const shades = colorValues.shades(10).map((value) => value.rgbString())

      return {
        tints: tints.slice(0, tints.length - 1),
        shades: shades.slice(0, shades.length - 1)
      }
    } catch (error) {
      return {
        tints: [],
        shades: []
      }
    }
  }
})
