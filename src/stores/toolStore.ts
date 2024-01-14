import { Tool } from "src/models/Tool"
import base64EncodeDecodeTool from "src/tools/base64-encode-decode-tool.js"
import characterCounterTool from "src/tools/character-counter-tool.ts"
import compareListTool from "src/tools/compare-list-tool.js"
import cronReadableTool from "src/tools/cron-readable-tool.js"
import faviconGrabberTool from "src/tools/favicon-grabber-tool.js"
import generateRandomStringTool from "src/tools/generate-random-string.js"
import generateUuid from "src/tools/generate-uuid-tool.js"
import hashTool from "src/tools/hash-tool.js"
import jsonFormatter from "src/tools/json-formatter-tool.js"
import loremIpsumGeneratorTool from "src/tools/lorem-ipsum-generator-tool.js"
import mathEvaluatorTool from "src/tools/math-evaluator-tool.ts"
import millisecondsToDate from "src/tools/milliseconds-to-date-tool.js"
import prefixSuffixLines from "src/tools/prefix-suffix-lines-tool.js"
import removeDuplicateList from "src/tools/remove-duplicate-lines-tool.js"
import sortList from "src/tools/sort-list-tool.js"
import testPipelines from "src/tools/test-pipelines-tool.js"
import textEditorTool from "src/tools/text-editor-tool.js"
import textTransformTool from "src/tools/text-transform-tool.js"
import uriEncodeDecodeTool from "src/tools/uri-encode-decode-tool.js"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolPreset } from "src/types/ToolPreset"

class ToolStore {
  /**
   * List of tool presets
   */
  private readonly _toolPresets: ToolPreset[] = [
    {
      toolId: "prefix-suffix-lines",
      presetId: "sql-where-query",
      name: "SQL Where Query",
      inputValues: {
        prefix: "'",
        suffix: "',",
        input: ""
      }
    }
  ]

  /**
   * Map of built-in tools
   */
  private readonly _mapOfTools: Record<string, ToolConstructor> = {
    [removeDuplicateList.toolId]: removeDuplicateList,
    [sortList.toolId]: sortList,
    [compareListTool.toolId]: compareListTool,
    [prefixSuffixLines.toolId]: prefixSuffixLines,
    [millisecondsToDate.toolId]: millisecondsToDate,
    [testPipelines.toolId]: testPipelines,
    [textTransformTool.toolId]: textTransformTool,
    [hashTool.toolId]: hashTool,
    [generateUuid.toolId]: generateUuid,
    [generateRandomStringTool.toolId]: generateRandomStringTool,
    [jsonFormatter.toolId]: jsonFormatter,
    [cronReadableTool.toolId]: cronReadableTool,
    [mathEvaluatorTool.toolId]: mathEvaluatorTool,
    [characterCounterTool.toolId]: characterCounterTool,
    [uriEncodeDecodeTool.toolId]: uriEncodeDecodeTool,
    [base64EncodeDecodeTool.toolId]: base64EncodeDecodeTool,
    [loremIpsumGeneratorTool.toolId]: loremIpsumGeneratorTool,
    [faviconGrabberTool.toolId]: faviconGrabberTool,
    [textEditorTool.toolId]: textEditorTool
  }

  get mapOfTools() {
    const presets = Object.fromEntries(this._toolPresets.map((preset) => {
      const toolConstructor = this._mapOfTools[preset.toolId]
      const tool = Tool.mergeWithPresets(toolConstructor, preset)

      return [tool.toolId, tool]
    }))

    return { ...this._mapOfTools, ...presets }
  }

  /**
   * List of built-in tools
   */
  get listOfTools() {
    return Object.values(this.mapOfTools)
  }

  /**
   * List of built-in tools name
   */
  get mapOfToolsName(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.mapOfTools).map(([toolId, tool]) => [toolId, tool.name])
    )
  }
}

export const toolStore = new ToolStore()
