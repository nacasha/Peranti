import { FC, useId } from "react";

import "./SingleTextareaInput.scss";
import { BaseInputComponentProps } from "../../../types/BaseInputComponentProps";

interface SingleTextareaInputProps extends BaseInputComponentProps {}

export const SingleTextareaInput: FC<SingleTextareaInputProps> = (props) => {
  const id = useId()
  const { onSubmit, initialValue, label = "Input" } = props;

  const onInputBlur: React.DOMAttributes<HTMLTextAreaElement>['onBlur'] = (event) => {
    const value = event.target.value;
    onSubmit(value.trim())
  }

  return (
    <div className="SingleTextareaInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <textarea id={id} onBlur={onInputBlur} defaultValue={initialValue} />
    </div>
  );
}
