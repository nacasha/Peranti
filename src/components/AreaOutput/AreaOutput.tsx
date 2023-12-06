import { FC } from "react";
import { rootStore } from "../../store/root-store";
import { listOfOutputComponent } from "../Output";

interface OutputComponentProps {
  component: string;
  field: string;
  props: any;
}

const OutputComponent: FC<OutputComponentProps> = (props) => {
  const { component, field, props: componentProps } = props;

  const Component = (listOfOutputComponent as any)[component]
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
    <div className="ToolRunArea-output">
      {outputs.map((output) => (
        <OutputComponent
          key={currentTool.title + output.field}
          field={output.field}
          component={output.component}
          props={output.props}
        />
      ))}
    </div>
  );
}
