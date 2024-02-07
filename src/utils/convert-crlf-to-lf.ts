export function convertCRLFtoLF(inputString: string) {
  // Use the replace method to replace all occurrences of "\r\n" with "\n"
  const lfString = inputString.replace(/\r\n/g, "\n")
  return lfString
}
