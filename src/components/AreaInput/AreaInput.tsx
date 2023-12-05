import { FC } from "react";
import { rootStore } from "../../store/root-store";
import { CheckboxInput } from "../Input/CheckboxInput";
import { SingleTextareaInput } from "../Input/SingleTextareaInput";
import { SingleTextInput } from "../Input/SingleTextInput";

const InputComponents = {
  CheckboxInput: CheckboxInput,
  SingleTextareaInput: SingleTextareaInput,
  SingleTextInput: SingleTextInput,
}

interface InputComponentProps {
  component: string;
  field: string;
  props: any;
  initialValue: any;
}

const InputComponent: FC<InputComponentProps> = (props) => {
  const { component, field, props: componentProps, initialValue } = props;

  const Component = (InputComponents as any)[component]
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
    <div className="input-area">
      <div className="area-content-padded">
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
