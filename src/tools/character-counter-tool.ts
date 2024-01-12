import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  input: string
}

interface OutputFields {
  output: unknown
}

const characterCounterTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "character-counter",
  name: "Word Counter",
  category: "Text",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  layoutReversed: true,
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "GridStat"
    }
  ],
  action({ input }) {
    const emptyInput = input.length === 0

    const charactersCount = emptyInput ? 0 : input.length
    const charactersWithoutSpacesCount = emptyInput ? 0 : input.replace(/\s/g, "").length
    const wordsCount = emptyInput ? 0 : input.split(/\s+/).length
    const paragraphsCount = emptyInput ? 0 : input.split(/\n\s*/).length

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
}

export default characterCounterTool
