import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

const characterCounterTool = new Tool({
  toolId: "character-counter",
  name: "Character Counter",
  category: "Text",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  layoutReversed: true,
  inputs: [
    {
      key: "input",
      label: "Input",
      component: "Textarea",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "GridStat"
    }
  ],
  action({ input }: { input: string }) {
    const emptyInput = input.length === 0

    const charactersCount = emptyInput ? 0 : input.length
    const charactersWithoutSpacesCount = emptyInput ? 0 : input.replace(/\s/g, "").length
    const wordsCount = emptyInput ? 0 : input.split(/\s+/).length
    const paragraphsCount = emptyInput ? 0 : input.split(/\n\s*\n/).length

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
