import { ToolType } from "src/enums/ToolType"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolPreset } from "src/types/ToolPreset"

export function mergeToolConstructorWithPreset(toolConstructor: ToolConstructor, preset: ToolPreset) {
  let presetInputs = []

  if (Array.isArray(toolConstructor.inputFields)) {
    presetInputs = [...toolConstructor.inputFields].map((input) => {
      const newInput = { ...input }
      newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
      return newInput
    })
  } else {
    const computedInputFields = toolConstructor.inputFields({})
    presetInputs = [...computedInputFields].map((input) => {
      const newInput = { ...input }
      newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
      return newInput
    })
  }

  const tool: ToolConstructor = {
    ...toolConstructor,
    name: preset.name,
    toolId: preset.presetId,
    inputFields: presetInputs,
    category: preset.category ?? toolConstructor.category,
    type: ToolType.Preset
  }

  return tool
}
