import { Tool } from "../../types/Tool";

const generateUuid: Tool = {
  title: "Generate UUID",
  action: ({ numberOfGenerated }: { numberOfGenerated: number }) => {


    return {  }
  },
  inputs: [
    {
      field: "numberOfGenerated",
      component: "SingleTextInput",
      defaultValue: 1,
      props: { label: "Number of Generated UUID" }
    }
  ],
  outputs: [
    {
      field: "output",
      component: "SingleTextOutput",
    },
  ]
}

export default generateUuid
