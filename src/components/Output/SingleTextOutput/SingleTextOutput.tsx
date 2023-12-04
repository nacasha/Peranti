import { FC } from "react";

import "./SingleTextOutput.scss";

interface SingleTextOutputProps {
  output: string;
}

export const SingleTextOutput: FC<SingleTextOutputProps> = (props) => {
  const { output } = props;

  return (
      <div className="SingleTextOutput">
        <div tabIndex={0} className="box">
          {output}
        </div>
    </div>
  );
}
