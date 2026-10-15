import { ColorHistory } from "src/components/history/ColorHistory"
import { FileHistory } from "src/components/history/FileHistory"
import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { ColorPickerInput } from "src/components/inputs/ColorPickerInput"
import { DateRangeInput } from "src/components/inputs/DateRangeInput"
import { DateTimeInput } from "src/components/inputs/DateTimeInput"
import { FileInput, FilesInput } from "src/components/inputs/FileInput"
import { ListPickInput } from "src/components/inputs/ListPickInput"
import { ListReorderInput } from "src/components/inputs/ListReorderInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput-2"
import { TextInput } from "src/components/inputs/TextInput"
import { AppletComponent } from "src/models/AppletComponent"

import { autoFocusProp, fileProps, itemsProp, languageProp, optionsProp, placeholderProp } from "./shared-props.js"

/**
 * Built-in input components, by the name a field's `component` uses
 */
export const inputComponents = {
  Checkbox: new AppletComponent({
    component: CheckboxInput,
    value: {
      type: "boolean",
      example: true
    },
    hideInHistory: true
  }),

  TextArea: new AppletComponent({
    component: TextAreaInput,
    props: [autoFocusProp, placeholderProp],
    value: {
      type: "string",
      description: "Text, may hold several lines",
      example: "line 1\nline 2"
    },
    maximizable: true,
    copyAs: "text",
    saveAs: "text",
    readFileAs: "text"
  }),

  Text: new AppletComponent({
    component: TextInput,
    props: [
      {
        name: "type",
        type: "string",
        default: "text",
        options: ["text", "number", "email", "url", "password", "search", "tel"],
        description: "Kind of text box"
      },
      placeholderProp,
      autoFocusProp
    ],
    value: {
      type: "string",
      description: "One line of text",
      example: "hello"
    },
    batchComponent: "Code",
    copyAs: "text"
  }),

  DateTime: new AppletComponent({
    component: DateTimeInput,
    props: [autoFocusProp],
    value: {
      type: "string",
      description: "Date, with the time only when one is picked; empty when cleared",
      example: "2026-10-12 14:30:00"
    },
    batchComponent: "Code",
    copyAs: "text"
  }),

  DateRange: new AppletComponent({
    component: DateRangeInput,
    props: [
      {
        name: "presets",
        type: "array",
        description: "Quick ranges next to the calendar: [{ label, start, end }], replacing the default ones (last 5 minutes to last 30 days)",
        example: [
          { label: "Last 15 minutes", start: "now-15m", end: "now" },
          { label: "Last 1 hour", start: "now-1h", end: "now" }
        ]
      }
    ],
    value: {
      type: "object",
      description: "{ start, end }, each \"now\", relative to now (\"now-15m\", s/m/h/d/w) or an ISO date with its offset",
      fields: [
        { name: "start", type: "string", required: true, description: "\"now-1h\" or \"2026-10-15T09:00:00+07:00\"" },
        { name: "end", type: "string", required: true, description: "\"now\" or an ISO date" }
      ],
      example: { start: "now-1h", end: "now" }
    }
  }),

  ListReorder: new AppletComponent({
    component: ListReorderInput,
    props: [itemsProp("Labels of the items to reorder, often set by computedProps")],
    value: {
      type: "json-string",
      description: "New order as item indexes, items come from props.items",
      example: "[2, 0, 1, 3]"
    },
    exampleProps: {
      items: ["Apple", "Banana", "Cherry", "Durian"]
    },
    hideInHistory: true
  }),

  ListPick: new AppletComponent({
    component: ListPickInput,
    props: [
      itemsProp("Labels of the items to tick, often set by computedProps"),
      {
        name: "selection",
        type: "string",
        default: "include",
        options: ["include", "exclude"],
        description: "Whether the value lists the ticked items or the unticked ones"
      }
    ],
    value: {
      type: "json-string",
      description: "Indexes of the ticked items, or the unticked ones with props.selection \"exclude\". Items come from props.items",
      example: "[1, 3]"
    },
    exampleProps: {
      items: ["Apple", "Banana", "Cherry", "Durian"]
    },
    hideInHistory: true
  }),

  Select: new AppletComponent({
    component: SelectInput,
    props: [
      optionsProp([
        { label: "UTF-8", value: "utf8" },
        { label: "ASCII", value: "ascii" }
      ])
    ],
    value: {
      type: "string",
      description: "Value of the picked option in props.options",
      example: "utf8"
    },
    hideInHistory: true
  }),

  Switch: new AppletComponent({
    component: SwitchInput,
    props: [
      optionsProp([
        { label: "Upper", value: "upper" },
        { label: "Lower", value: "lower" }
      ])
    ],
    value: {
      type: "string",
      description: "Value of the picked option in props.options",
      example: "upper"
    },
    hideInHistory: true
  }),

  Run: new AppletComponent({
    component: RunInput,
    value: {
      type: "none",
      description: "A button that runs the tool"
    },
    hideInHistory: true
  }),

  File: new AppletComponent({
    component: FileInput,
    props: fileProps,
    value: {
      type: "file",
      description: "A browser File, or null when cleared. Not JSON"
    },
    readFileAs: "file",
    historyComponent: FileHistory
  }),

  Files: new AppletComponent({
    component: FilesInput,
    props: fileProps,
    value: {
      type: "files",
      description: "A list of browser Files. Not JSON"
    },
    readFileAs: "files",
    historyComponent: FileHistory
  }),

  Code: new AppletComponent({
    component: CodeInput,
    props: [languageProp, autoFocusProp, placeholderProp],
    value: {
      type: "string",
      description: "Source text, props.language sets the highlighting",
      example: "{ \"a\": 1 }"
    },
    maximizable: true,
    copyAs: "text",
    saveAs: "text",
    readFileAs: "text"
  }),

  ColorPicker: new AppletComponent({
    component: ColorPickerInput,
    value: {
      type: "string",
      description: "Hex color",
      example: "#3b82f6"
    },
    maximizable: true,
    historyComponent: ColorHistory
  })
}

export type InputComponents = typeof inputComponents
