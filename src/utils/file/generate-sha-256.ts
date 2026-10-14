import hash from "hash.js"

export function generateSha256(input: string) {
  return hash.sha256().update(input).digest("hex")
}
