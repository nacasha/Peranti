interface Input {
  listA: string
  listB: string
}

interface Output {
  output: unknown
  onlyExistInputA: unknown
  onlyExistInputB: unknown
}

export function compareListAction(inputParams: Input): Output {
  const { listA, listB } = inputParams

  const linesA = listA.split("\n")
  const linesB = listB.split("\n")

  const bothExist = linesA.filter(line => linesB.includes(line)).join("\n")
  const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join("\n")
  const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join("\n")

  return { output: bothExist, onlyExistInputA, onlyExistInputB }
}
