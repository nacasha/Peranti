import { Tool } from "src/models/Tool"

import { hashAction } from "./hash-action"

const hashTool = new Tool({
  toolId: "hash",
  name: "Hash",
  category: "Generator",
  action: hashAction,
  layout: "top-bottom-auto",
  inputs: [
    {
      key: "input",
      component: "Text",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      key: "md5",
      component: "Text",
      props: { label: "MD5" }
    },
    {
      key: "sha1",
      component: "Text",
      props: { label: "SHA1" }
    },
    {
      key: "sha256",
      component: "Text",
      props: { label: "SHA256" }
    },
    {
      key: "sha512",
      component: "Text",
      props: { label: "SHA512" }
    }
  ]
})

export default hashTool
