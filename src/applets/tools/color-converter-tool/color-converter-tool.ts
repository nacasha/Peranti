import { colord, extend } from "colord"
import hwbPlugin from "colord/plugins/hwb"
import lchPlugin from "colord/plugins/lch"
import minifyPlugin from "colord/plugins/minify"
import namesPlugin from "colord/plugins/names"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  color: InputFieldsType.Code
}

interface OutputFields {
  visual: OutputFieldsType.Color
  hex: OutputFieldsType.Text
  rgb: OutputFieldsType.Text
  hsl: OutputFieldsType.Text
  hwb: OutputFieldsType.Text
  lch: OutputFieldsType.Text
  minified: OutputFieldsType.Text
  name: OutputFieldsType.Text
}

extend([hwbPlugin, lchPlugin, minifyPlugin, namesPlugin])

export const colorConverterTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "color-converter",
  name: "Color Converter",
  description: "Color conversions from/to Hex, RGB(A), HSL(A), HSV(A)",
  category: "Color",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' 1fr"
  },
  inputFields: [
    {
      key: "color",
      label: "Color",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    }
  ],
  outputFields: [
    {
      key: "visual",
      label: "Visual",
      component: "Color"
    },
    {
      key: "hex",
      label: "HEX",
      component: "Text",
      allowBatch: true

    },
    {
      key: "rgb",
      label: "RGB",
      component: "Text",
      allowBatch: true

    },
    {
      key: "hsl",
      label: "HSL",
      component: "Text",
      allowBatch: true
    },
    {
      key: "hwb",
      label: "HWB",
      component: "Text",
      allowBatch: true
    },
    {
      key: "lch",
      label: "LCH",
      component: "Text",
      allowBatch: true
    },
    {
      key: "minified",
      label: "Minified",
      component: "Text",
      allowBatch: true
    },
    {
      key: "name",
      label: "Name",
      component: "Text",
      allowBatch: true
    }
  ],
  action: async({ inputValues }) => {
    const { color } = inputValues
    const colordInstance = colord(color)

    return {
      visual: colordInstance.toHex(),
      hex: colordInstance.toHex(),
      rgb: colordInstance.toRgbString(),
      hsl: colordInstance.toHslString(),
      hwb: colordInstance.toHwbString(),
      lch: colordInstance.toLchString(),
      minified: colordInstance.minify(),
      name: colordInstance.toName({ closest: true }) ?? "Unknown"
    }
  }
})
