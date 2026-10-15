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
  compareBy: InputFieldsType.Select
  layout: InputFieldsType.Switch
  ignoreWhitespace: InputFieldsType.Switch
  ignoreCase: InputFieldsType.Switch
  ignoreBlankLines: InputFieldsType.Switch
}

const switchOptions = [
  { value: "off", label: "Off" },
  { value: "on", label: "On" }
]

/**
 * Clean a text before comparing, so the differences it ignores don't show.
 * The diff shows the cleaned text.
 */
function normalizeText(text: string, options: { ignoreWhitespace: boolean, ignoreCase: boolean, ignoreBlankLines: boolean }) {
  let lines = text.split(/\r?\n/)

  if (options.ignoreWhitespace) {
    lines = lines.map((line) => line.trim().replace(/\s+/g, " "))
  }
  if (options.ignoreBlankLines) {
    lines = lines.filter((line) => line.trim().length > 0)
  }

  const normalized = lines.join("\n")
  return options.ignoreCase ? normalized.toLowerCase() : normalized
}

export const textCompareTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "text-compare",
  name: "Text Compare",
  category: "Text",
  description: "Compare two texts and highlight their differences by character, word or line",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input output' 1fr / 1.5fr 2fr"
  },
  inputFields: [
    {
      key: "inputA",
      label: "Text A",
      component: "Code",
      defaultValue: ""
    },
    {
      key: "inputB",
      label: "Text B",
      component: "Code",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Differences",
      component: "Diff",
      props: {
        leftTitle: "Text A",
        rightTitle: "Text B"
      }
    }
  ],
  options: [
    {
      key: "compareBy",
      label: "Compare By",
      component: "Select",
      defaultValue: DiffMethod.WORDS,
      props: {
        options: [
          { label: "Characters", value: DiffMethod.CHARS },
          { label: "Words", value: DiffMethod.WORDS },
          { label: "Lines", value: DiffMethod.LINES }
        ]
      }
    },
    {
      key: "layout",
      label: "Layout",
      component: "Switch",
      defaultValue: "split",
      props: {
        options: [
          { value: "split", label: "Side by Side" },
          { value: "unified", label: "Unified" }
        ]
      }
    },
    {
      key: "ignoreWhitespace",
      label: "Ignore Whitespace",
      component: "Switch",
      defaultValue: "off",
      props: {
        options: switchOptions
      }
    },
    {
      key: "ignoreCase",
      label: "Ignore Case",
      component: "Switch",
      defaultValue: "off",
      props: {
        options: switchOptions
      }
    },
    {
      key: "ignoreBlankLines",
      label: "Ignore Blank Lines",
      component: "Switch",
      defaultValue: "off",
      props: {
        options: switchOptions
      }
    }
  ],
  presets: [
    {
      name: "Paragraph Edit",
      inputValues: {
        inputA: "The quick brown fox jumps over the lazy dog.\nIt was a sunny day in the park.\nEveryone was happy.",
        inputB: "The quick red fox leaped over the lazy dog.\nIt was a sunny day in the park.\nEveryone was very happy."
      }
    },
    {
      name: "Config File",
      inputValues: {
        inputA: "server:\n  port: 8080\n  host: localhost\nlogging:\n  level: info",
        inputB: "server:\n  port: 9090\n  host: localhost\n  timeout: 30s\nlogging:\n  level: debug"
      }
    }
  ],
  action: ({ inputValues, options }) => {
    const { inputA, inputB } = inputValues
    const normalizeOptions = {
      ignoreWhitespace: options.ignoreWhitespace === "on",
      ignoreCase: options.ignoreCase === "on",
      ignoreBlankLines: options.ignoreBlankLines === "on"
    }

    return {
      output: {
        oldCode: normalizeText(inputA, normalizeOptions),
        newCode: normalizeText(inputB, normalizeOptions),
        compareMethod: options.compareBy as DiffMethod,
        splitView: options.layout !== "unified"
      }
    }
  }
})
