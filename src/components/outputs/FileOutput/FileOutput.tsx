import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { useState, type FC, useEffect } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./FileOutput.scss"

interface FileOutputProps extends OutputComponentProps<string> {}

export const FileOutput: FC<FileOutputProps> = (props) => {
  const { label, value = "", fieldKey } = props
  const [initialized, setInitialized] = useState(() => false)

  const documents: Array<{ uri: string }> = []
  try {
    if (value && value.trim().length > 0) {
      documents.push({ uri: value })
    }
  } catch (exception) {
    console.log(exception)
  }

  useEffect(() => {
    setTimeout(() => {
      setInitialized(true)
    }, 10)
  }, [])

  return (
    <div className="FileOutput" style={{ gridArea: fieldKey }}>
      <ComponentLabel label={label} />
      {initialized && (
        <div className="FileOutput-viewer-container">
          <div className="FileOutput-viewer-body">
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
          </div>
        </div>
      )}
    </div>
  )
}
