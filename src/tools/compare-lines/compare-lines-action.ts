interface InputParams {
  inputA: string;
  inputB: string;
}

interface OutputMap {
  output: unknown;
  onlyExistInputA: unknown;
  onlyExistInputB: unknown;
}

export function compareLinesAction(inputParams: InputParams): OutputMap {
  const { inputA, inputB } = inputParams

  const linesA = inputA.split('\n');
  const linesB = inputB.split('\n');

  const bothExist = linesA.filter(line => linesB.includes(line)).join('\n');
  const onlyExistInputA = linesA.filter(line => !linesB.includes(line)).join('\n');
  const onlyExistInputB = linesB.filter(line => !linesA.includes(line)).join('\n');

  return { output: bothExist, onlyExistInputA, onlyExistInputB }
}
