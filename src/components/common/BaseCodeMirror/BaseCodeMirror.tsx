import { historyField } from "@codemirror/commands"
import { jsonLanguage } from "@codemirror/lang-json"
import { markdownLanguage } from "@codemirror/lang-markdown"
import { githubLight } from "@uiw/codemirror-theme-github"
import { monokaiDimmed } from "@uiw/codemirror-theme-monokai-dimmed"
import CodeMirror, { EditorView, type ReactCodeMirrorRef, type ReactCodeMirrorProps, type ViewUpdate } from "@uiw/react-codemirror"
import { useRef, type FC, useEffect } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore.ts"

import "./BaseCodeMirror.scss"

export interface BaseCodeMirrorProps {
  language?: "json" | "plain" | "markdown"
}

interface InitialStateCodeMirror {
  editor: any
  scroll: number
}

interface Props extends BaseCodeMirrorProps, Omit<ReactCodeMirrorProps, "theme" | "extensions"> {
  onStateChange?: (value: unknown) => void
  initialStateCodeMirror?: InitialStateCodeMirror
}

const stateFields = { history: historyField }

export const BaseCodeMirror: FC<Props> = (props) => {
  const {
    language = "plain",
    onChange,
    onStateChange,
    initialStateCodeMirror,
    ...codeMirrorProps
  } = props

  const isDarkMode = useSelector(() => interfaceStore.isThemeDarkMode)
  const textAreaWordWrapEnabled = useSelector(() => interfaceStore.textAreaWordWrap)

  const editor = useRef<ReactCodeMirrorRef>(null)

  const editorStateRef = useRef(null)
  const scrollStateRef = useRef(0)

  const initialState = initialStateCodeMirror?.editor
    ? { json: initialStateCodeMirror?.editor, fields: stateFields }
    : undefined

  const getExtensions = () => {
    const extensions = []

    if (textAreaWordWrapEnabled) {
      extensions.push(EditorView.lineWrapping)
    }
    if (language === "json") {
      extensions.push(jsonLanguage)
    } else if (language === "markdown") {
      extensions.push(markdownLanguage)
    }

    return extensions
  }

  const getCodeMirrorState = (): InitialStateCodeMirror => {
    return {
      editor: editorStateRef.current,
      scroll: scrollStateRef.current
    }
  }

  const handleStateChange = (viewUpdate: ViewUpdate) => {
    editorStateRef.current = viewUpdate.state.toJSON(stateFields)
  }

  const handleOnChange: ReactCodeMirrorProps["onChange"] = (value, viewUpdate) => {
    handleStateChange(viewUpdate)
    if (onChange) {
      onChange(value, viewUpdate)
    }
  }

  const handleCreateEditor = (view: EditorView) => {
    view.scrollDOM.scrollTo({ top: Number(initialStateCodeMirror?.scroll) })
  }

  useEffect(() => {
    return () => {
      if (editorStateRef.current && onStateChange) {
        onStateChange(getCodeMirrorState())
      }
    }
  }, [])

  return (
    <div className="CodeMirrorContainer">
      <CodeMirror
        {...codeMirrorProps}
        ref={editor}
        theme={isDarkMode ? monokaiDimmed : githubLight}
        extensions={getExtensions()}
        initialState={initialState}
        onChange={handleOnChange}
        onUpdate={handleStateChange}
        onCreateEditor={handleCreateEditor}
        onScrollCapture={() => {
          scrollStateRef.current = editor.current?.view?.scrollDOM.scrollTop ?? 0
        }}
      />
    </div>
  )
}
