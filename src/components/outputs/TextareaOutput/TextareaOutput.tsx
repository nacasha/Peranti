import { githubLight, githubDark } from "@uiw/codemirror-theme-github"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { observer } from "mobx-react"
import { useId, type FC } from "react"

import { interfaceStore } from "src/stores/interfaceStore.ts"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./TextareaOutput.scss"

export const TextareaOutput: FC<OutputComponentProps> = observer((props) => {
  const id = useId()
  const { output, label = "Output" } = props
  const textAreaWordWrapEnabled = interfaceStore.textAreaWordWrap
  const isDarkMode = interfaceStore.isThemeDarkMode

  return (
    <div className="TextareaOutput">
      <label htmlFor={id} className="InputOutputLabel">{label}</label>
      <div className="CodeMirrorContainer">
        <CodeMirror
          id={id}
          value={output}
          theme={isDarkMode ? githubDark : githubLight}
          extensions={textAreaWordWrapEnabled ? [EditorView.lineWrapping] : []}
          readOnly
        />
      </div>
    </div>
  )
})
