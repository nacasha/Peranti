import { jsonLanguage } from "@codemirror/lang-json"
import { markdownLanguage } from "@codemirror/lang-markdown"
import { githubLight } from "@uiw/codemirror-theme-github"
import { monokaiDimmed } from "@uiw/codemirror-theme-monokai-dimmed"
import CodeMirror, { EditorView, type ReactCodeMirrorRef, type ReactCodeMirrorProps, type ViewUpdate } from "@uiw/react-codemirror"
import { useRef, type FC, useEffect, useState } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore.ts"

import "./BaseCodeMirror.scss"

export interface BaseCodeMirrorProps {
  language?: "json" | "plain" | "markdown"
}

interface InitialStateCodeMirror {
  editor: any
  scroll: {
    top: number
    left: number
  }
}

interface Props extends BaseCodeMirrorProps, Omit<ReactCodeMirrorProps, "theme" | "extensions"> {
  onStateChange?: (value: unknown) => void
  initialStateCodeMirror?: InitialStateCodeMirror
}

// TODO: If history has many changes, IndexedDB will really slow to store the data
// const stateFields = { history: historyField }

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

  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const editorStateRef = useRef(null)
  const scrollStateRef = useRef<InitialStateCodeMirror["scroll"]>(
    initialStateCodeMirror?.scroll ?? { left: 0, top: 0 }
  )

  const [ready, setReady] = useState(false)

  const initialState = initialStateCodeMirror?.editor
    ? { json: initialStateCodeMirror?.editor }
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
    editorStateRef.current = viewUpdate.state.toJSON()
  }

  const handleOnChange: ReactCodeMirrorProps["onChange"] = (value, viewUpdate) => {
    handleStateChange(viewUpdate)
    if (onChange) {
      onChange(value, viewUpdate)
    }
  }

  const handleCreateEditor = (view: EditorView) => {
    /**
     * Delay a bit for layout to be ready based on content
     */
    setTimeout(() => {
      view.scrollDOM.scrollTop = Number(scrollStateRef.current.top)
      view.scrollDOM.scrollLeft = Number(scrollStateRef.current.left)
      setReady(true)
    }, 10)
  }

  const handleScroll = () => {
    if (editorRef.current?.state && editorRef.current?.view?.scrollDOM?.scrollTop !== undefined) {
      scrollStateRef.current = {
        top: editorRef.current?.view?.scrollDOM?.scrollTop ?? 0,
        left: editorRef.current?.view?.scrollDOM?.scrollLeft ?? 0
      }
    }
  }

  useEffect(() => {
    if (editorRef.current?.view) {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [editorRef.current?.view])

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
        ref={editorRef}
        theme={isDarkMode ? monokaiDimmed : githubLight}
        extensions={getExtensions()}
        initialState={initialState}
        onChange={handleOnChange}
        onUpdate={handleStateChange}
        onCreateEditor={handleCreateEditor}
        onScrollCapture={handleScroll}
        style={{ opacity: ready ? "1" : "0" }}
      />
    </div>
  )
}
