import { FC, useId } from "react"

import "./CheckboxInput.scss";

interface CheckboxInputProps {
  label: string;
  onSubmit: (value: boolean) => any;
  initialValue: boolean;
}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const { label, onSubmit, initialValue } = props;
  const id = useId()

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
