import { FC } from "react";

import "./SingleTextareaInput.scss";

interface SingleTextareaInputProps {
  onSubmit: (value: string) => any;
  initialValue: string;
}

export const SingleTextareaInput: FC<SingleTextareaInputProps> = (props) => {
  const { onSubmit, initialValue } = props;

  const onInputBlur: React.DOMAttributes<HTMLTextAreaElement>['onBlur'] = (event) => {
    const value = event.target.value;
    onSubmit(value)
  }

  return (
    <div className="SingleTextareaInput">
      <textarea onBlur={onInputBlur} defaultValue={initialValue} />
    </div>
  );
}
