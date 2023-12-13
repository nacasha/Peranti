import { type Tool } from "src/models/Tool"

import compareList from "./compare-list"
import generateRandomStringTool from "./generate-random-string"
import generateUuid from "./generate-uuid"
import hashTool from "./hash"
import jsonFormatter from "./json-formatter"
import millisecondsToDate from "./milliseconds-to-date"
import prefixSuffixLines from "./prefix-suffix-lines"
import removeDuplicateList from "./remove-duplicate-lines"
import sortList from "./sort-list"
import testPipelines from "./test-pipelines"
import textTransformTool from "./text-transform"

export const mapOfTools: Record<string, Tool> = {
  [removeDuplicateList.toolId]: removeDuplicateList,
  [sortList.toolId]: sortList,
  [compareList.toolId]: compareList,
  [generateUuid.toolId]: generateUuid,
  [prefixSuffixLines.toolId]: prefixSuffixLines,
  [millisecondsToDate.toolId]: millisecondsToDate,
  [hashTool.toolId]: hashTool,
  [testPipelines.toolId]: testPipelines,
  [textTransformTool.toolId]: textTransformTool,
  [generateRandomStringTool.toolId]: generateRandomStringTool,
  [jsonFormatter.toolId]: jsonFormatter
}

export const listOfTools = Object.values(mapOfTools)

export const mapOfToolsName: Record<string, string> = Object.fromEntries(
  Object.entries(mapOfTools).map(([toolId, tool]) => [toolId, tool.name])
)
