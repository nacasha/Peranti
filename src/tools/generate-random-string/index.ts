import { Tool } from "src/models/Tool"
import { generateRandomString } from "src/utils/generateRandomString"

const generateRandomStringTool = new Tool({
  id: "generate-random-string",
  name: "Generate Random String",
  category: "Generator",
  action: ({ stringLength }: { stringLength: number }) => {
    const output = generateRandomString(stringLength)

    return { output }
  },
  inputs: [
    {
      key: "stringLength",
      component: "Text",
      defaultValue: 1,
      props: {
        label: "String Length"
      }
    }
  ],
  outputs: [
    {
      key: "output",
      component: "Textarea"
    }
  ]
})

export default generateRandomStringTool
