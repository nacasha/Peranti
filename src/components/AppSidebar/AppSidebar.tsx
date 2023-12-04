import { useState } from "react";

export const AppSidebar = () => {
  const [title, setTitle] = useState("");

  const pipelines = [
    {
      title: "Remove Duplicate Lines",
    },
    {
      title: "Sort Lines",
    },
    {
      title: "Date To Miliseconds",
    },
    {
      title: "Miliseconds To Date",
    },
  ]

  const onClickItem = (pipeline: typeof pipelines[0]) => () => {
    setTitle(pipeline.title)
  }

  return (
    <div className="app-sidebar">
      {pipelines.map((pipeline) => (
        <div key={pipeline.title} className="app-sidebar-item" onClick={onClickItem(pipeline)}>
          {pipeline.title}
        </div>
      ))}
    </div>
  );
}
