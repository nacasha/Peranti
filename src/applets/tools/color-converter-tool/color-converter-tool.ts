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
  hex: OutputFieldsType.KeyValue
  rgb: OutputFieldsType.KeyValue
  hsl: OutputFieldsType.KeyValue
  hwb: OutputFieldsType.KeyValue
  lch: OutputFieldsType.KeyValue
  minified: OutputFieldsType.KeyValue
  name: OutputFieldsType.KeyValue
}

extend([hwbPlugin, lchPlugin, minifyPlugin, namesPlugin])

export const colorConverterTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "color-converter",
  name: "Color Converter",
  description: "Color conversions from/to Hex, RGB(A), HSL(A), HSV(A)",
  category: "Color",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' min-content"
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
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "rgb",
      label: "RGB",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "hsl",
      label: "HSL",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "hwb",
      label: "HWB",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "lch",
      label: "LCH",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "minified",
      label: "Minified",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "name",
      label: "Name",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
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
