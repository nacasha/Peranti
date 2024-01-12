import { githubLight, githubDark } from "@uiw/codemirror-theme-github"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { observer } from "mobx-react"
import { type FC, useState } from "react"

import { interfaceStore } from "src/stores/interfaceStore.ts"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextareaInput.scss"

interface TextareaInputProps extends InputComponentProps {}

export const TextareaInput: FC<TextareaInputProps> = observer((props) => {
  const { onSubmit, initialValue, readOnly, label } = props
  const [value, setValue] = useState<string>(() => initialValue ?? "")
  const textAreaWordWrapEnabled = interfaceStore.textAreaWordWrap
  const isDarkMode = interfaceStore.isThemeDarkMode

  const onInputChange = (newValue: string) => {
    setValue(newValue)
    onSubmit(newValue)
  }

  return (
    <div className="TextareaInput">
      <label className="InputOutputLabel">
        {label}
      </label>
      <div className="CodeMirrorContainer">
        <CodeMirror
          value={value}
          theme={isDarkMode ? githubDark : githubLight}
          onChange={(newValue) => { onInputChange(newValue) }}
          extensions={textAreaWordWrapEnabled ? [EditorView.lineWrapping] : []}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
})
