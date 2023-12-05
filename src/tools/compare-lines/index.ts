import { Tool } from "../../types/Tool";

const compareLines: Tool = {
  title: "Compare Lines",
  action: ({ inputA, inputB }: { inputA: String, inputB: String }) => {
    const linesA = inputA.split('\n');
    const linesB = inputB.split('\n');

    const bothExist = linesA.filter(line => linesB.includes(line)).join('\n');
    const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join('\n');
    const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join('\n');

    return { output: bothExist, onlyExistInputA, onlyExistInputB }
  },
  inputs: [
    {
      field: "inputA",
      component: "SingleTextareaInput",
      defaultValue: "",
      props: { label: "Input A" }
    },
    {
      field: "inputB",
      component: "SingleTextareaInput",
      defaultValue: "",
      props: { label: "Input B" }
    },
  ],
  outputs: [
    {
      field: "onlyExistInputA",
      component: "SingleTextOutput",
      props: { label: "Only Exist In List A" }
    },
    {
      field: "output",
      component: "SingleTextOutput",
      props: { label: "Exist In Both List" }
    },
    {
      field: "onlyExistInputB",
      component: "SingleTextOutput",
      props: { label: "Only Exist In List B" }
    }
  ]
}

export default compareLines
