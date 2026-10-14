import { DiffMethod } from "react-diff-viewer"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  inputA: InputFieldsType.Code
  inputB: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Diff
}

interface Options {
  sortKeys: InputFieldsType.Switch
}

/**
 * Copy of a JSON value with the keys of every object in alphabetical order,
 * array order is kept since it is part of the data
 */
function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys)
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJsonKeys((value as Record<string, unknown>)[key])])
    )
  }
  return value
}

/**
 * Parse one side and print it in one fixed format, so only the data differs.
 * Returns the parse error when the text is not (yet) valid JSON.
 */
function normalizeJson(text: string, sortKeys: boolean): { code: string, error?: undefined } | { code?: undefined, error: string } {
  if (text.trim().length === 0) {
    return { code: "" }
  }

  try {
    const value: unknown = JSON.parse(text)
    return { code: JSON.stringify(sortKeys ? sortJsonKeys(value) : value, null, 2) }
  } catch (error) {
    return { error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export const jsonDiffTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "json-diff",
  fileExtensions: ["json"],
  name: "JSON Compare Diff",
  category: "JSON",
  description: "Compare the data of two JSON documents, ignoring formatting and key order",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input output' 1fr / 1.5fr 2fr"
  },
  inputFields: [
    {
      key: "inputA",
      label: "JSON A",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    },
    {
      key: "inputB",
      label: "JSON B",
      component: "Code",
      defaultValue: "",
      props: {
        language: "json"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "JSON Diff",
      component: "Diff",
      props: {
        leftTitle: "JSON A",
        rightTitle: "JSON B",
        compareMethod: DiffMethod.WORDS
      }
    }
  ],
  options: [
    {
      key: "sortKeys",
      label: "Ignore Key Order",
      component: "Switch",
      defaultValue: "on",
      props: {
        options: [
          { value: "off", label: "Off" },
          { value: "on", label: "On" }
        ]
      }
    }
  ],
  samples: [
    {
      name: "Reordered And Reformatted",
      inputValues: {
        inputA: "{\"id\": 42, \"name\": \"Ann\", \"roles\": [\"admin\", \"dev\"], \"address\": {\"city\": \"Oslo\", \"zip\": \"0150\"}}",
        inputB: "{\n    \"name\": \"Ann\",\n    \"id\": 42,\n    \"address\": {\n        \"zip\": \"0151\",\n        \"city\": \"Oslo\"\n    },\n    \"roles\": [\"admin\", \"dev\", \"ops\"]\n}"
      }
    }
  ],
  action: ({ inputValues, options, previousOutputValues }) => {
    const { inputA, inputB } = inputValues
    const sortKeys = options.sortKeys === "on"
    const previous = (previousOutputValues as Partial<OutputFields>).output

    const sideA = normalizeJson(inputA, sortKeys)
    const sideB = normalizeJson(inputB, sortKeys)

    // A side that is not valid JSON, such as while typing, keeps showing its
    // last valid version, and its input card says why
    const invalidSides = [sideA.error && "JSON A", sideB.error && "JSON B"].filter(Boolean)
    const inputErrors: Record<string, string> = {}
    if (sideA.error) inputErrors.inputA = sideA.error
    if (sideB.error) inputErrors.inputB = sideB.error

    return {
      output: {
        oldCode: sideA.code ?? previous?.oldCode ?? "",
        newCode: sideB.code ?? previous?.newCode ?? ""
      },
      $errors: {
        input: inputErrors,
        output: invalidSides.length > 0
          ? { output: `${invalidSides.join(" and ")} ${invalidSides.length > 1 ? "are" : "is"} invalid, showing the last valid version` }
          : {}
      }
    }
  }
})
