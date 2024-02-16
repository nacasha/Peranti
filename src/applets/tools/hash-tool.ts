import hash from "hash.js"
import hashMd5 from "md5"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { generateRandomString, stringEntries } from "src/utils/generate-random-string"

interface InputFields {
  input: InputFieldsType.Text
}

interface OutputFields {
  md5: OutputFieldsType.Text
  sha1: OutputFieldsType.Text
  sha256: OutputFieldsType.Text
  sha512: OutputFieldsType.Text
}

const hashTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "hash",
  name: "Generate Hash",
  description: "Encrypt text or file to MD5/SHA1/SHA256/SHA512",
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
    {
      name: "Random String",
      inputValues: () => ({
        input: generateRandomString(15, stringEntries.smallAz)
      })
    },
    {
      name: "Batch Random String",
      isBatchModeEnabled: true,
      inputValues: () => ({
        input: new Array(5).map(() => generateRandomString(15, stringEntries.smallAz)).join("\n")
      })
    }
  ],
  action: ({ inputValues }) => {
    const { input } = inputValues

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
