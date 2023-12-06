import { FC } from "react";

import "./SingleTextareaOutput.scss";

interface SingleTextareaOutputProps {
  output: string;
  label: string;
}

export const SingleTextareaOutput: FC<SingleTextareaOutputProps> = (props) => {
  const { output, label = "Output" } = props;

  return (
      <div className="SingleTextareaOutput">
        <div className="InputOutputLabel">
          {label}
        </div>
        <div className="box-container">
          <textarea className="box" value={output} readOnly />
        </div>
    </div>
  );
}
