import textToUppercase from "./text-to-uppercase"
import textToLowercase from "./text-to-lowercase"
import removeDuplicateList from "./remove-duplicate-lines"
import sortList from "./sort-list"
import compareList from "./compare-list"
import generateUuid from "./generate-uuid"
import prefixSuffixLines from "./prefix-suffix-lines"
import millisecondsToDate from "./milliseconds-to-date"
import hash from "./hash"
import testPipelines from "./test-pipelines"
import textTransformTool from "./text-transform"
import { type Tool } from "src/models/Tool"
import generateRandomStringTool from "./generate-random-string"

export const mapOfTool: Record<string, Tool> = {
  [textToUppercase.id]: textToUppercase,
  [textToLowercase.id]: textToLowercase,
  [removeDuplicateList.id]: removeDuplicateList,
  [sortList.id]: sortList,
  [compareList.id]: compareList,
  [generateUuid.id]: generateUuid,
  [prefixSuffixLines.id]: prefixSuffixLines,
  [millisecondsToDate.id]: millisecondsToDate,
  [hash.id]: hash,
  [testPipelines.id]: testPipelines,
  [textTransformTool.id]: textTransformTool,
  [generateRandomStringTool.id]: generateRandomStringTool
}

export const listOfTools = Object.values(mapOfTool)
