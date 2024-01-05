import cronstrue from "cronstrue"
import "cronstrue/locales/id"

interface Input {
  input: string
}

interface Output {
  output: unknown
}

export function cronReadableAction(inputParams: Input): Output {
  const { input } = inputParams

  const inputLines = input.split("\n")

  const outputLines = inputLines.map((line) => cronstrue.toString(line, { locale: "id" }))
  const output = outputLines.join("\n")

  return { output }
}
