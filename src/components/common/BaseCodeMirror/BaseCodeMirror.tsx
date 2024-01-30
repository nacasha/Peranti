import { jsonLanguage } from "@codemirror/lang-json"
import { markdownLanguage } from "@codemirror/lang-markdown"
import { githubLight } from "@uiw/codemirror-theme-github"
import { monokaiDimmed } from "@uiw/codemirror-theme-monokai-dimmed"
import CodeMirror, { EditorView, type ReactCodeMirrorProps } from "@uiw/react-codemirror"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore.ts"

import "./BaseCodeMirror.scss"

export interface BaseCodeMirrorProps {
  language?: "json" | "plain" | "markdown"
}

interface Props extends BaseCodeMirrorProps, Omit<ReactCodeMirrorProps, "theme" | "extensions"> {}

export const BaseCodeMirror: FC<Props> = (props) => {
  const { language = "plain", ...codeMirrorProps } = props
  const textAreaWordWrapEnabled = useSelector(() => interfaceStore.textAreaWordWrap)
  const isDarkMode = useSelector(() => interfaceStore.isThemeDarkMode)

  const extensions = []

  if (textAreaWordWrapEnabled) {
    extensions.push(EditorView.lineWrapping)
  }

  if (language === "json") {
    extensions.push(jsonLanguage)
  } else if (language === "markdown") {
    extensions.push(markdownLanguage)
  }

  return (
    <div className="CodeMirrorContainer">
      <CodeMirror
        {...codeMirrorProps}
        theme={isDarkMode ? monokaiDimmed : githubLight}
        extensions={extensions}
      />
    </div>
  )
}
