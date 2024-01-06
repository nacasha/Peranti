import { loremIpsum, type ILoremIpsumParams } from "lorem-ipsum"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

interface InputFields {
  count: string
  type: ILoremIpsumParams["units"]
}

interface OutputFields {
  output: string
}

const loremIpsumGeneratorTool = new Tool<InputFields, OutputFields>({
  toolId: "lorem-ipsum-generator",
  name: "Lorem Ipsum Generator",
  category: "Generator",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  inputs: (inputParams: any) => {
    const { type } = inputParams
    const typeOptions = [
      { value: "words", label: "Words" },
      { value: "sentences", label: "Sentences" },
      { value: "paragraphs", label: "Paragraphs" }
    ]

    const numberOfGeneratedLabel = typeOptions.find((option) => option.value === type)?.label

    return [
      {
        key: "type",
        label: "Type",
        component: "Switch",
        defaultValue: "paragraphs",
        props: {
          options: typeOptions
        }
      },
      {
        key: "count",
        label: `Number of Generated ${numberOfGeneratedLabel}`,
        component: "Text",
        defaultValue: "2",
        props: {
          type: "number"
        }
      }
    ]
  },
  outputs: [
    {
      key: "output",
      label: "Output",
      component: "Textarea"
    }
  ],
  action({ count, type }) {
    const output = loremIpsum({
      count: Number(count),
      format: "plain",
      paragraphLowerBound: 3,
      paragraphUpperBound: 7,
      random: Math.random,
      sentenceLowerBound: 5,
      sentenceUpperBound: 15,
      suffix: "\n",
      units: type
    })

    return { output }
  }
})

export default loremIpsumGeneratorTool
