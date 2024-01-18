import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { useState, type FC, useEffect } from "react"

import { type OutputComponentProps } from "src/types/OutputComponentProps"

interface FileOutputProps extends OutputComponentProps<string> {}

export const FileOutput: FC<FileOutputProps> = (props) => {
  const { output = "" } = props
  const [initialized, setInitialized] = useState(() => false)

  const documents = [
    { uri: output } // Remote file
  ]

  useEffect(() => {
    setTimeout(() => {
      setInitialized(true)
    }, 300)
  }, [])

  if (!initialized) {
    return null
  }

  return (
    <DocViewer
      documents={documents}
      initialActiveDocument={documents[0]}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
          retainURLParams: false
        }
      }}
    />
  )
}
