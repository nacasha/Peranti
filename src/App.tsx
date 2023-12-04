import { useEffect, useState } from "react";
import { AppTitlebar } from "./components/AppTitlebar";
import { AppSidebar } from "./components/AppSidebar";
import { SingleTextareaInput } from "./components/Input/SingleTextareaInput";
import { SingleTextOutput } from "./components/Output/SingleTextOutput";
import { CheckboxInput } from "./components/Input/CheckboxInput";

import textToUppercase from "./pipelines/text-to-uppercase";

const InputComponents = {
  CheckboxInput,
  SingleTextareaInput,
}

const OutputComponents = {
  SingleTextOutput
}

function App() {
  const [inputParams, setInputParams] = useState<Record<string, any>>({ trim: false, input: "" });
  const [outputParams, setOutputParams] = useState<Record<string, any>>({});

  const currentPipeline = textToUppercase

  const renderInput = () => {
    const { input: inputs } = currentPipeline

    return (
      <>
        {inputs.map((input) => {
          const Component = (InputComponents as any)[input.component]
          const onSubmit = (val: any) => setInputParams((prevState) => {
            return { ...prevState, [input.key]: val }
          })

          return (
            <Component
              {...input.props}
              key={input.key}
              initialValue={inputParams[input.key]}
              onSubmit={onSubmit}
            />
          )
        })}
      </>
    )
  }

  const renderOutput = () => {
    const { output: outputs } = currentPipeline

    return (
      <>
        {outputs.map((output) => {
          const Component = (OutputComponents as any)[output.component]

          return (
            <Component
              {...output.props}
              key={output.key}
              {...{[output.key]: outputParams[output.key]}}
            />
          )
        })}
      </>
    )
  }

  useEffect(() => {
    const { action } = currentPipeline;

    const result: any = action(inputParams as any)
    setOutputParams(result)
  }, [inputParams])

  return (
    <div className="root">
      <AppTitlebar title="Dev Pipe" />

      <div className="app-content">
        <AppSidebar />
        <div className="content">
          {/* Toolbar */}
          <div className="content-toolbar">
            <div className="toolbar-button">
              <button>Clear</button>
            </div>
            <div className="toolbar-button">
              <button>Copy Output</button>
            </div>
          </div>

          {/* Content */}
          <div className="content-area">
            <div className="input-area">
              <div className="area-content">
                <div className="area-content-padded">
                  {renderInput()}
                </div>
              </div>
            </div>
            <div className="output-area">
              <div className="area-content">
                <div className="area-content-padded">
                  {renderOutput()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
