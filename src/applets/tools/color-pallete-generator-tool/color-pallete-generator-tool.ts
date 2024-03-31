import randomColor from "randomcolor"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"

interface InputFields {
  hue: InputFieldsType.Code
  hueType: InputFieldsType.Switch
  count: InputFieldsType.Text
  luminosity: InputFieldsType.Switch
  run: InputFieldsType.Run
}

export const colorPalleteGeneratorTool = new AppletConstructor<InputFields>({
  appletId: "color-pallete-generator",
  name: "Color Pallete Generator",
  description: "Generate attractive color pallete",
  category: "Color",
  autoRun: false,
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' 1fr"
  },
  inputFields: ({ hueType }) => ([
    {
      key: "count",
      label: "Color Count",
      component: "Text",
      defaultValue: "15",
      props: {
        type: "number"
      }
    },
    {
      key: "hueType",
      label: "Hue",
      component: "Switch",
      defaultValue: "random",
      props: {
        options: [
          { label: "Random", value: "random" },
          { label: "Custom", value: "custom" }
        ]
      }
    },
    ...(hueType === "custom"
      ? [{
        key: "hue",
        label: "Custom Hue",
        component: "ColorPicker",
        defaultValue: "#ffffff"
      }]
      : [] as any),
    {
      key: "luminosity",
      label: "Luminosity",
      component: "Switch",
      defaultValue: "random",
      props: {
        options: [
          { label: "Random", value: "random" },
          { label: "Bright", value: "bright" },
          { label: "Dark", value: "dark" },
          { label: "Light", value: "light" }
        ]
      }
    },
    {
      key: "run",
      label: "Generate Color",
      component: "Run",
      defaultValue: ""
    }
  ]),
  outputFields: [
    {
      key: "colors",
      label: "Generated Colors",
      component: "ColorPallete",
      props: {
        showInfo: true
      }
    }
  ],
  action: async({ inputValues }) => {
    const { count, luminosity, hue, hueType } = inputValues

    const colors = randomColor({
      count: Number(count),
      luminosity: luminosity as any,
      hue: hueType === "random" ? "random" : hue
    })

    return { colors }
  }
})
