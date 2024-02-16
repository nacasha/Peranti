import { jsonLanguage } from "@codemirror/lang-json"
import { markdownLanguage } from "@codemirror/lang-markdown"
import { githubLight } from "@uiw/codemirror-theme-github"
import { vscodeDarkInit } from "@uiw/codemirror-theme-vscode"
import CodeMirror, { EditorView, type ReactCodeMirrorRef, type ReactCodeMirrorProps, type ViewUpdate, EditorSelection } from "@uiw/react-codemirror"
import { useRef, type FC, useEffect, useState } from "react"

import { Theme } from "src/enums/theme"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

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

// TODO: If history contains many changes, IndexedDB will really slow to store the data
// const stateFields = { history: historyField }

export const BaseCodeMirror: FC<Props> = (props) => {
  const {
    language = "plain",
    onChange,
    onStateChange,
    initialStateCodeMirror,
    value,
    ...codeMirrorProps
  } = props

  const isDarkMode = useSelector(() => interfaceStore.theme === Theme.Dark)
  const textAreaWordWrapEnabled = useSelector(() => interfaceStore.textAreaWordWrap)

  const editorComponentRef = useRef<ReactCodeMirrorRef>(null)
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
    if (initialStateCodeMirror?.editor?.doc) {
      editorComponentRef.current?.view?.dispatch({
        selection: EditorSelection.create([
          EditorSelection.range(0, 0)
        ])
      })
    }

    setTimeout(() => {
      const initialTop = Number(initialStateCodeMirror?.scroll.top ?? 0)
      const initialLeft = Number(initialStateCodeMirror?.scroll.left ?? 0)

      view.scrollDOM.scrollTo({ top: initialTop, left: initialLeft })
      scrollStateRef.current = { top: initialTop, left: initialLeft }

      setReady(true)
    }, 50)
  }

  const handleScroll = () => {
    if (editorComponentRef.current?.state && editorComponentRef.current?.view?.scrollDOM?.scrollTop !== undefined) {
      scrollStateRef.current = {
        top: editorComponentRef.current?.view?.scrollDOM?.scrollTop ?? 0,
        left: editorComponentRef.current?.view?.scrollDOM?.scrollLeft ?? 0
      }
    }
  }

  useEffect(() => {
    if (editorComponentRef.current?.view) {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [editorComponentRef.current?.view])

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
        ref={editorComponentRef}
        value={value}
        theme={isDarkMode
          ? vscodeDarkInit({
            settings: {
              foreground: "#bcbec4",
              background: "#292a30",
              gutterBackground: "#292a30",
              gutterBorder: "1px solid red"
            }
          })
          : githubLight}
        extensions={getExtensions()}
        initialState={initialState}
        onChange={handleOnChange}
        onUpdate={handleStateChange}
        onCreateEditor={handleCreateEditor}
        onScrollCapture={handleScroll}
        style={{ opacity: ready ? "1" : "0" }}
        basicSetup={{
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          foldGutter: false
        }}
      />
    </div>
  )
}
