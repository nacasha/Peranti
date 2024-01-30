import { loremIpsum, type ILoremIpsumParams } from "lorem-ipsum"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  count: InputFieldsType.Text
  type: ILoremIpsumParams["units"]
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const loremIpsumGeneratorTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "lorem-ipsum-generator",
  name: "Lorem Ipsum Generator",
  category: "Generator",
  layoutSetting: {
    direction: "vertical",
    inputAreaSize: "auto"
  },
  inputFields: (inputParams) => {
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
        skipValidateHasValue: true,
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
      component: "Code"
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
