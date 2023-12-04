import textToUppercase from "./text-to-uppercase";

export default {
  title: "Text To Uppercase",
  action: textToUppercase,
  input: [
    {
      key: "trim",
      component: "CheckboxInput",
      props: {
        label: "Trim"
      }
    },
    {
      key: "input",
      component: "SingleTextareaInput"
    }
  ],
  output: [
    {
      key: "output",
      component: "SingleTextOutput",
      props: {}
    }
  ]
}
