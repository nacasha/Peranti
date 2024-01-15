import { loremIpsum, type ILoremIpsumParams } from "lorem-ipsum"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  count: string
  type: ILoremIpsumParams["units"]
}

interface OutputFields {
  output: OutputFieldsType.Textarea
}

const loremIpsumGeneratorTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "lorem-ipsum-generator",
  name: "Lorem Ipsum Generator",
  category: "Generator",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  inputFields: (inputParams: any) => {
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
  outputFields: [
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
}

export default loremIpsumGeneratorTool
