import hash from "hash.js"
import hashMd5 from "md5"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { generateRandomString, stringEntries } from "src/utils/generateRandomString"

interface InputFields {
  input: InputFieldsType.Text
}

interface OutputFields {
  md5: OutputFieldsType.Text
  sha1: OutputFieldsType.Text
  sha256: OutputFieldsType.Text
  sha512: OutputFieldsType.Text
}

const hashTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "hash",
  name: "Generate Hash",
  category: "Generator",
  layoutSetting: {
    direction: "vertical",
    gridTemplate: "auto 1fr"
  },
  inputFields: [
    {
      key: "input",
      label: "Input",
      component: "Text",
      defaultValue: "",
      allowBatch: true,
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
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
  samples: [
    { input: "admin" },
    { input: "admin12345" },
    { input: "password" },
    { input: "string-with-symbols" },
    () => ({ input: "random-" + generateRandomString(10, stringEntries.smallAz) })
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
}

export default hashTool
