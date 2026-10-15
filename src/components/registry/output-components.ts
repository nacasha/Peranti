import { ColorHistory } from "src/components/history/ColorHistory"
import { ColorPalleteHistory } from "src/components/history/ColorPalleteHistory"
import { GridStatHistory } from "src/components/history/GridStatHistory"
import { ImageHistory } from "src/components/history/ImageHistory"
import { CodeOutput } from "src/components/outputs/CodeOutput"
import { ColorOutput } from "src/components/outputs/ColorOutput"
import { ColorPalleteOutput } from "src/components/outputs/ColorPalleteOutput"
import { DataGridOutput } from "src/components/outputs/DataGridOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { JsonTreeOutput } from "src/components/outputs/JsonTreeOutput"
import { KeyValueOutput } from "src/components/outputs/KeyValueOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { MermaidOutput } from "src/components/outputs/MermaidOutput"
import { PintoraOutput } from "src/components/outputs/PintoraOutput"
import { ReactOutput } from "src/components/outputs/ReactOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput-2"
import { TextOutput } from "src/components/outputs/TextOutput"
import { AppletComponent } from "src/models/AppletComponent"

import { languageProp } from "./shared-props.js"

/**
 * Built-in output components, by the name a field's `component` uses
 */
export const outputComponents = {
  Code: new AppletComponent({
    component: CodeOutput,
    props: [languageProp],
    value: {
      type: "any",
      description: "Text as is, anything else shown as indented JSON",
      example: { a: 1 }
    },
    maximizable: true,
    copyAs: "text",
    saveAs: "text"
  }),

  // Both sides of the diff are already the tab's inputs
  Diff: new AppletComponent({
    component: DiffOutput,
    props: [
      {
        name: "splitView",
        type: "boolean",
        default: true,
        description: "Both texts side by side, or one merged view"
      },
      {
        name: "compareMethod",
        type: "string",
        default: "diffChars",
        options: ["diffChars", "diffWords", "diffWordsWithSpace", "diffLines", "diffTrimmedLines", "diffSentences", "diffCss"],
        description: "What counts as one change"
      },
      {
        name: "leftTitle",
        type: "string",
        description: "Title above the old text",
        example: "Before"
      },
      {
        name: "rightTitle",
        type: "string",
        description: "Title above the new text",
        example: "After"
      }
    ],
    value: {
      type: "object",
      description: "Two texts to compare: { oldCode, newCode }",
      example: { oldCode: "a\nb", newCode: "a\nc" },
      fields: [
        { name: "oldCode", type: "string", required: true, description: "Text before, shown on the left" },
        { name: "newCode", type: "string", required: true, description: "Text after, shown on the right" },
        { name: "compareMethod", type: "string", description: "Overrides the compareMethod prop, for tools that pick it from an option" },
        { name: "splitView", type: "boolean", description: "Overrides the splitView prop, for tools that pick it from an option" }
      ]
    },
    maximizable: true,
    hideInHistory: true
  }),

  File: new AppletComponent({
    component: FileOutput,
    value: {
      type: "string",
      description: "URL or path of a document to view",
      example: "https://example.com/file.pdf"
    },
    hideInHistory: true
  }),

  GridStat: new AppletComponent({
    component: GridStatOutput,
    value: {
      type: "array",
      description: "Stats as [{ label, value }], or that list as JSON text",
      example: [
        { label: "Words", value: 12 },
        { label: "Lines", value: 3 }
      ],
      fields: [
        { name: "label", type: "string", required: true, description: "Name of the stat" },
        { name: "value", type: "any", required: true, description: "Its value, a string or a number" }
      ]
    },
    historyComponent: GridStatHistory
  }),

  IFrame: new AppletComponent({
    component: IFrameOutput,
    value: {
      type: "none",
      description: "Ignores its value"
    },
    hideInHistory: true
  }),

  Image: new AppletComponent({
    component: ImageOutput,
    value: {
      type: "string",
      description: "Anything an <img src> takes, such as a data URL",
      example: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><rect width='80' height='40' fill='%233b82f6'/></svg>"
    },
    maximizable: true,
    saveAs: "image",
    historyComponent: ImageHistory
  }),

  Markdown: new AppletComponent({
    component: MarkdownOutput,
    value: {
      type: "string",
      description: "Markdown source",
      example: "# Title\n\nSome **bold** text"
    },
    maximizable: true,
    copyAs: "text",
    saveAs: "text"
  }),

  TextArea: new AppletComponent({
    component: TextAreaOutput,
    value: {
      type: "string",
      description: "Text, may hold several lines",
      example: "line 1\nline 2"
    },
    maximizable: true,
    copyAs: "text",
    saveAs: "text"
  }),

  Text: new AppletComponent({
    component: TextOutput,
    value: {
      type: "string",
      description: "One line of text",
      example: "42"
    },
    batchComponent: "Code",
    copyAs: "text",
    saveAs: "text"
  }),

  Mermaid: new AppletComponent({
    component: MermaidOutput,
    value: {
      type: "string",
      description: "Mermaid source",
      example: "graph TD; A-->B"
    },
    maximizable: true
  }),

  Pintora: new AppletComponent({
    component: PintoraOutput,
    value: {
      type: "string",
      description: "Pintora source",
      example: "sequenceDiagram\n  A->>B: hello"
    },
    maximizable: true
  }),

  React: new AppletComponent({
    component: ReactOutput,
    value: {
      type: "string",
      description: "JSX source, run as is",
      example: "<h1>Hello</h1>"
    },
    maximizable: true,
    hideInHistory: true
  }),

  DataGrid: new AppletComponent({
    component: DataGridOutput,
    value: {
      type: "json-string",
      description: "Rows as a JSON array, written as text",
      example: "[{\"name\": \"a\", \"size\": 1}, {\"name\": \"b\", \"size\": 2}]"
    },
    maximizable: true,
    hideInHistory: true
  }),

  JsonTree: new AppletComponent({
    component: JsonTreeOutput,
    props: [
      {
        name: "expandDepth",
        type: "number",
        default: 2,
        description: "Levels opened when the data is first shown"
      }
    ],
    value: {
      type: "any",
      description: "Any JSON value, or JSON written as text",
      example: {
        name: "Peranti",
        tags: ["dev", "tools"],
        stars: 42,
        archived: false,
        owner: null
      }
    },
    maximizable: true,
    hideInHistory: true
  }),

  Color: new AppletComponent({
    component: ColorOutput,
    value: {
      type: "string",
      description: "Any CSS color",
      example: "#ff0000"
    },
    historyComponent: ColorHistory
  }),

  ColorPallete: new AppletComponent({
    component: ColorPalleteOutput,
    props: [
      {
        name: "showInfo",
        type: "boolean",
        default: false,
        description: "Show the hex code on each color"
      },
      {
        name: "singleColor",
        type: "boolean",
        default: false,
        description: "Take one color as a plain string instead of a list"
      }
    ],
    value: {
      type: "array",
      description: "Colors as a list of strings, or that list as JSON text",
      example: ["#ef4444", "#22c55e", "#3b82f6"],
      itemType: "string"
    },
    historyComponent: ColorPalleteHistory
  }),

  KeyValue: new AppletComponent({
    component: KeyValueOutput,
    props: [
      {
        name: "fields",
        type: "object",
        description: "Row order and labels: { key: { label } }, keys left out are hidden",
        example: {
          words: { label: "Words" },
          lines: { label: "Lines" }
        }
      },
      {
        name: "label",
        type: "string",
        description: "Title of the card when several KeyValue fields are grouped",
        example: "Stats"
      }
    ],
    value: {
      type: "object",
      description: "One row per key, or that object as JSON text",
      example: { words: 12, lines: 3 }
    },
    batchComponent: "Code",
    hideInHistory: true
  })
}

export type OutputComponents = typeof outputComponents
