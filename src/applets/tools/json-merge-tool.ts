import { merge } from "ts-deepmerge"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  files: InputFieldsType.Files
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  arrayStrategy: InputFieldsType.Select
}

const jsonMergeTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "json-merge",
  fileExtensions: ["json"],
  name: "JSON Merge",
  description: "Deep merge multiple JSON files into one",
  category: "JSON",
  inputFields: [
    {
      key: "files",
      label: "JSON Files",
      component: "Files",
      defaultValue: [],
      props: {
        accept: ".json,application/json"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code",
      props: {
        language: "json"
      }
    }
  ],
  options: [
    {
      key: "arrayStrategy",
      label: "Nested Arrays",
      component: "Select",
      defaultValue: "concat",
      props: {
        options: [
          { label: "Concat", value: "concat" },
          { label: "Replace", value: "replace" }
        ]
      }
    }
  ],
  async action({ inputValues, options }) {
    const { arrayStrategy } = options

    // Values restored from a saved session are no longer File instances
    const files = Array.isArray(inputValues.files)
      ? inputValues.files.filter((file): file is File => file instanceof File)
      : []

    if (files.length === 0) {
      return { output: "" }
    }

    const documents: unknown[] = []
    for (const file of files) {
      try {
        documents.push(JSON.parse(await file.text()))
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Error"
        return { output: `Error parsing ${file.name}: ${message}` }
      }
    }

    if (documents.every(Array.isArray)) {
      return { output: JSON.stringify(documents.flat(), null, 2) }
    }

    if (documents.some((document) => Array.isArray(document) || typeof document !== "object" || document === null)) {
      return { output: "Error: Cannot merge objects with arrays, use all objects or all arrays" }
    }

    const merged = merge.withOptions(
      { mergeArrays: arrayStrategy === "concat" },
      ...(documents as Array<Record<string, unknown>>)
    )
    return { output: JSON.stringify(merged, null, 2) }
  }
})

export default jsonMergeTool
