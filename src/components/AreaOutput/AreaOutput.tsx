import { FC } from "react";
import { rootStore } from "../../store/root-store";
import { SingleTextOutput } from "../Output/SingleTextOutput";

const OutputComponents = {
  SingleTextOutput: SingleTextOutput
}

interface OutputComponentProps {
  component: string;
  field: string;
  props: any;
}

const OutputComponent: FC<OutputComponentProps> = (props) => {
  const { component, field, props: componentProps } = props;

  const Component = (OutputComponents as any)[component]
  const outputValue = rootStore.output.useTracked.params()[field]

  return (
    <Component
      {...componentProps}
      key={field}
      output={outputValue}
    />
  )
}

export const AreaOutput = () => {
  const currentTool = rootStore.tool.use.currentToolOrEmpty()
  const { outputs } = currentTool

  return (
    <div className="output-area">
      <div className="area-content-padded">
        {outputs.map((output) => (
          <OutputComponent
            key={currentTool.title + output.field}
            field={output.field}
            component={output.component}
            props={output.props}
          />
        ))}
      </div>
    </div>
  );
}
