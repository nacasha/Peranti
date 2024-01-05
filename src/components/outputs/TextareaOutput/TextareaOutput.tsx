import { githubLight, githubDark } from "@uiw/codemirror-theme-github"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { observer } from "mobx-react"
import { useId, type FC } from "react"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import "./TextareaOutput.scss"

interface TextareaOutputProps {
  output: string
  label: string
}

export const TextareaOutput: FC<TextareaOutputProps> = observer((props) => {
  const id = useId()
  const { output, label = "Output" } = props
  const textAreaWordWrapEnabled = interfaceStore.textAreaWordWrap
  const isDarkMode = interfaceStore.theme === "dark"

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
