interface Input {
  input: string
  type: string
}

interface Output {
  output: unknown
}

export function jsonFormatterAction(inputParams: Input): Output {
  const { input, type } = inputParams
  if (input.trim().length === 0) return { output: "" }

  try {
    const isPretty = type === "pretty"
    const jsonObj = JSON.parse(input)
    const output = JSON.stringify(jsonObj, null, isPretty ? 2 : undefined)
    return { output }
  } catch (error) {
    if (error instanceof Error) {
      const output = `Error formatting JSON: ${error.message}`
      return { output }
    } else {
      return { output: "Unknown Error" }
    }
  }
}
