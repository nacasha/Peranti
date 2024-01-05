import { githubLight, githubDark } from "@uiw/codemirror-theme-github"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { observer } from "mobx-react"
import { type FC, useId, useState } from "react"

import { interfaceStore } from "src/stores/interfaceStore.ts"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextareaInput.scss"

interface TextareaInputProps extends InputComponentProps {}

export const TextareaInput: FC<TextareaInputProps> = observer((props) => {
  const id = useId()
  const { onSubmit, initialValue, readOnly, label } = props
  const [value, setValue] = useState<string>(() => initialValue ?? "")
  const textAreaWordWrapEnabled = interfaceStore.textAreaWordWrap
  const isDarkMode = interfaceStore.theme === "dark"

  const onInputChange = (newValue: string) => {
    setValue(newValue.trim())
    onSubmit(newValue.trim())
  }

  return (
    <div className="TextareaInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <div className="CodeMirrorContainer">
        <CodeMirror
          id={id}
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
