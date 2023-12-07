interface InputParams {
  input: string
}

interface OutputMap {
  output: unknown
}

export function removeDuplicateLinesActions (inputParams: InputParams): OutputMap {
  const { input } = inputParams

  // Split the input string into an array of lines
  const lines = input.split("\n")

  // Use a Set to keep track of unique lines
  const uniqueLines = new Set(lines)

  // Convert the Set back to an array and join the lines
  const output = Array.from(uniqueLines).join("\n")

  return { output }
}
