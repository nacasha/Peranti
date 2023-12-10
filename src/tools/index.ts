import textToUppercase from "./text-to-uppercase"
import textToLowercase from "./text-to-lowercase"
import removeDuplicateList from "./remove-duplicate-lines"
import sortList from "./sort-list"
import compareList from "./compare-list"
import generateUuid from "./generate-uuid"
import prefixSuffixLines from "./prefix-suffix-lines"
import millisecondsToDate from "./milliseconds-to-date"
import hashTool from "./hash"
import testPipelines from "./test-pipelines"
import textTransformTool from "./text-transform"
import { type Tool } from "src/models/Tool"
import generateRandomStringTool from "./generate-random-string"
import jsonFormatter from "./json-formatter"

export const mapOfTools: Record<string, Tool> = {
  [textToUppercase.instanceId]: textToUppercase,
  [textToLowercase.instanceId]: textToLowercase,
  [removeDuplicateList.instanceId]: removeDuplicateList,
  [sortList.instanceId]: sortList,
  [compareList.instanceId]: compareList,
  [generateUuid.instanceId]: generateUuid,
  [prefixSuffixLines.instanceId]: prefixSuffixLines,
  [millisecondsToDate.instanceId]: millisecondsToDate,
  [hashTool.instanceId]: hashTool,
  [testPipelines.instanceId]: testPipelines,
  [textTransformTool.instanceId]: textTransformTool,
  [generateRandomStringTool.instanceId]: generateRandomStringTool,
  [jsonFormatter.instanceId]: jsonFormatter
}

export const listOfTools = Object.values(mapOfTools)
