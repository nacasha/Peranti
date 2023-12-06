import { FC, useId } from "react";

import "./TextOutput.scss";

interface TextOutputProps {
  output: string;
  label: string;
}

export const TextOutput: FC<TextOutputProps> = (props) => {
  const id = useId()
  const { output, label = "Output" } = props;

  return (
      <div className="TextOutput">
        <label className="InputOutputLabel" htmlFor={id}>{label}</label>
        <input value={output} readOnly />
    </div>
  );
}
