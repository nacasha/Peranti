import { type Tool } from "src/types/Tool"
import { hashAction } from "./hash-action"

const hash: Tool = {
  id: "hash",
  title: "Hash",
  category: "Generator",
  action: hashAction,
  layout: "top-bottom-auto",
  inputs: [
    {
      field: "input",
      component: "Text",
      defaultValue: ""
    }
  ],
  outputs: [
    {
      field: "md5",
      component: "Text",
      props: { label: "MD5" }
    },
    {
      field: "sha1",
      component: "Text",
      props: { label: "SHA1" }
    },
    {
      field: "sha256",
      component: "Text",
      props: { label: "SHA256" }
    },
    {
      field: "sha512",
      component: "Text",
      props: { label: "SHA512" }
    }
  ]
}

export default hash
