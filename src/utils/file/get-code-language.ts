import { type BaseCodeMirrorProps } from "src/components/common/BaseCodeMirror"

type CodeLanguage = NonNullable<BaseCodeMirrorProps["language"]>

const LANGUAGE_BY_EXTENSION: Record<string, CodeLanguage> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "javascript",
  tsx: "javascript",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  yml: "yaml",
  yaml: "yaml",
  sql: "sql"
}

/**
 * Highlighting language of a file, from its extension, plain text when the
 * editor has none for it
 */
export function getCodeLanguage(filePath: string): CodeLanguage {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? ""
  return LANGUAGE_BY_EXTENSION[extension] ?? "plain"
}
