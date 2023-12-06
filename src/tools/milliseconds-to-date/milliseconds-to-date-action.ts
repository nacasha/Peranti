interface InputParams {
  input: string;
}

interface OutputMap {
  output: unknown;
}

export function millisecondsToDateAction(inputParams: InputParams): OutputMap {
  const { input: input  } = inputParams
  if (input.trim().length === 0) {
    return { output: "" }
  }

  const inputLines = input.split('\n');
  const dateLines = inputLines.map((milliseconds) => new Date(Number(milliseconds)).toLocaleString())

  return { output: dateLines.join('\n') }
}
