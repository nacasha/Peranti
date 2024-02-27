import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  prefix: InputFieldsType.Text
  suffix: InputFieldsType.Text
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const prefixSuffixLines = new AppletConstructor<InputFields, OutputFields>({
  appletId: "prefix-suffix-lines",
  name: "Prefix Suffix Lines",
  category: "List",
  inputFields: [
    {
      key: "prefix",
      label: "Prefix",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "suffix",
      label: "Suffix",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "input",
      label: "Text Lines",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  samples: [
    {
      name: "SQL Query",
      inputValues: {
        prefix: "'",
        suffix: "',",
        input: "f35ba00a-d346-472b-b9ef-6adb5a3e1ede\nf5faa1fe-5aab-4713-9758-22213860ec63\nf4e1d872-aa13-4770-bb1f-83ef3db2d8e2\n67662ba2-c62b-4852-9d8d-8a92c0336ee9\nc04cf098-44d7-428d-8663-1cf2abe85228"
      }
    },
    {
      name: "ID",
      inputValues: {
        prefix: "(id = '",
        suffix: "') or",
        input: "9cf8eff6-5873-44b2-b882-12db6ab28e7f\nfb740ab9-4acf-4a70-9b94-b4b84752e128\nb4ae048f-1750-4229-b620-7313d0ee043e\n1dc734b1-c69f-43d7-b56c-5152831e4214\n525ac328-bd3b-43b1-b656-24ab11e2227e"
      }
    },
    {
      name: "Append name",
      inputValues: {
        prefix: "name = ",
        suffix: "",
        input: "John\nAdelle\nKarina\nRey"
      }
    }
  ],
  action: ({ inputValues }) => {
    const { input, prefix, suffix } = inputValues

    const lines = input.split("\n")
      .filter((text) => text.trim().length > 0)
      .map((text) => prefix.concat(text.concat(suffix)))
    const resultString = Array.from(lines).join("\n")

    return { output: resultString }
  }
})

export default prefixSuffixLines
