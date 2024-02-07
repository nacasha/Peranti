import { ToolType } from "src/enums/ToolType"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolPreset } from "src/types/ToolPreset"

/**
   * Merge tool constructor with preset
   *
   * @param toolConstructor
   * @param preset
   * @returns
   */
export function mergeToolConstructorWithPreset(toolConstructor: ToolConstructor, preset: ToolPreset) {
  let presetInputs = []

  if (Array.isArray(toolConstructor.inputFields)) {
    presetInputs = [...toolConstructor.inputFields].map((input) => {
      /**
       * Assign input to new object because it still refers
       * to original variable, which is owned by main tool
       */
      const newInput = { ...input }
      newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
      return newInput
    })
  } else {
    const computedInputFields = toolConstructor.inputFields({})
    presetInputs = [...computedInputFields].map((input) => {
      /**
       * Assign input to new object because it still refers
       * to original variable, which is owned by main tool
       */
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
