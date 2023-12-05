import { FC, useId } from "react"

import "./CheckboxInput.scss";
import { BaseInputComponentProps } from "../../../types/BaseInputComponentProps";

interface CheckboxInputProps extends BaseInputComponentProps<boolean> {
  label: string;
}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const id = useId()
  const { label, onSubmit, initialValue } = props;

  const onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange'] = (event) => {
    onSubmit(event.target.checked)
  }

  return (
    <div className="CheckboxInput">
      <input id={id} type="checkbox" onChange={onChange} defaultChecked={!!initialValue} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
