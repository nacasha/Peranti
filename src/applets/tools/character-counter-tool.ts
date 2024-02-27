import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.GridStat
}

const characterCounterTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "character-counter",
  name: "Text Counter",
  category: "Text",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'output' min-content 'input' 1fr"
  },
  inputFields: [
    {
      key: "input",
      label: "Input",
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
      component: "GridStat"
    }
  ],
  action({ inputValues }) {
    const { input } = inputValues
    const isInputEmpty = input.length === 0

    const charactersCount = isInputEmpty ? 0 : input.length
    const charactersWithoutSpacesCount = isInputEmpty ? 0 : input.replace(/\s/g, "").length
    const wordsCount = isInputEmpty ? 0 : input.split(/\s+/).length
    const paragraphsCount = isInputEmpty ? 0 : input.split(/\n\s*/).length

    const output = [
      {
        label: "Characters",
        value: charactersCount
      },
      {
        label: "Characters Without Spaces",
        value: charactersWithoutSpacesCount
      },
      {
        label: "Words",
        value: wordsCount
      },
      {
        label: "Paragraphs",
        value: paragraphsCount
      }
    ]

    return { output }
  }
})

export default characterCounterTool
