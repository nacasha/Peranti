import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/types/AppletConstructor"
import { type Preset } from "src/types/Preset"

export function mergeAppletConstructorWithPreset(appletConstructor: AppletConstructor, preset: Preset) {
  let presetInputs = []

  if (Array.isArray(appletConstructor.inputFields)) {
    presetInputs = [...appletConstructor.inputFields].map((input) => {
      const newInput = { ...input }
      newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
      return newInput
    })
  } else {
    const computedInputFields = appletConstructor.inputFields({})
    presetInputs = [...computedInputFields].map((input) => {
      const newInput = { ...input }
      newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
      return newInput
    })
  }

  const mergedAppletConstructor: AppletConstructor = {
    ...appletConstructor,
    name: preset.name,
    appletId: preset.presetId,
    inputFields: presetInputs,
    category: preset.category ?? appletConstructor.category,
    type: AppletType.Preset
  }

  return mergedAppletConstructor
}
