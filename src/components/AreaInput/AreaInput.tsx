import { FC } from "react";
import { rootStore } from "../../store/root-store";
import { listOfInputComponent } from "../Input";

interface InputComponentProps {
  component: string;
  field: string;
  props: any;
  initialValue: any;
}

const InputComponent: FC<InputComponentProps> = (props) => {
  const { component, field, props: componentProps, initialValue } = props;

  const Component = (listOfInputComponent as any)[component]
  const onSubmit = (val: any) => rootStore.input.set.setParams(field, val)

  return (
    <Component
      {...componentProps}
      key={field}
      initialValue={initialValue}
      onSubmit={onSubmit}
    />
  )
}

export const AreaInput = () => {
  const currentTool = rootStore.tool.use.currentToolOrEmpty()
  const { inputs } = currentTool

  return (
    <div className="ToolRunArea-input">
      <div className="ToolRunArea-component-list">
        {inputs.map((input) => (
          <InputComponent
            key={currentTool.title + input.field}
            field={input.field}
            component={input.component}
            props={input.props}
            initialValue={input.defaultValue}
          />
        ))}
      </div>
    </div>
  );
}
