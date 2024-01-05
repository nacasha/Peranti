import { Tool } from "src/models/Tool"

import { hashAction } from "./hash-action.js"

const hashTool = new Tool({
  toolId: "hash",
  name: "Generate Hash",
  category: "Generator",
  action: hashAction,
  layout: "top-bottom-auto",
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
  ]
})

export default hashTool
