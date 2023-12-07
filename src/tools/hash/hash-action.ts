import hash from "hash.js"
import hashMd5 from "md5"

interface Input {
  input: string
}

interface Output {
  md5: unknown
  sha1: unknown
  sha256: unknown
  sha512: unknown
}

export function hashAction (inputParams: Input): Output {
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
