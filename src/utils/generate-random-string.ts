export const stringEntries = {
  smallAz: "abcdefghijklmnopqrstuvwxyz",
  capitalAz: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*"
}

export function generateRandomString(length: number, characters: string = ""): string {
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}
