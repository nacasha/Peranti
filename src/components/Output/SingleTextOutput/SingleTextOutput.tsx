import { FC } from "react";

import "./SingleTextOutput.scss";

interface SingleTextOutputProps {
  output: string;
  label: string;
}

export const SingleTextOutput: FC<SingleTextOutputProps> = (props) => {
  const { output, label = "Output" } = props;

  return (
      <div className="SingleTextOutput">
        <div>{label}</div>
        <div className="box-container">
          <textarea className="box" value={output} readOnly />
        </div>
    </div>
  );
}
