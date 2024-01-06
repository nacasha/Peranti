import hash from "hash.js"
import hashMd5 from "md5"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

interface InputFields {
  input: string
}

interface OutputFields {
  md5: unknown
  sha1: unknown
  sha256: unknown
  sha512: unknown
}

const hashTool = new Tool<InputFields, OutputFields>({
  toolId: "hash",
  name: "Generate Hash",
  category: "Generator",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  inputs: [
    {
      key: "input",
      label: "Input",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    }
  ],
  outputs: [
    {
      key: "md5",
      label: "MD5",
      component: "Text",
      allowBatch: true
    },
    {
      key: "sha1",
      label: "SHA1",
      component: "Text",
      allowBatch: true
    },
    {
      key: "sha256",
      label: "SHA256",
      component: "Text",
      allowBatch: true
    },
    {
      key: "sha512",
      label: "SHA512",
      component: "Text",
      allowBatch: true
    }
  ],
  action: (inputParams) => {
    const { input } = inputParams

    if (input.trim().length === 0) {
      return { md5: "", sha1: "", sha256: "", sha512: "" }
    }

    const md5 = hashMd5(input)
    const sha1 = hash.sha1().update(input).digest("hex")
    const sha256 = hash.sha256().update(input).digest("hex")
    const sha512 = hash.sha512().update(input).digest("hex")

    return { md5, sha1, sha256, sha512 }
  }
})

export default hashTool
