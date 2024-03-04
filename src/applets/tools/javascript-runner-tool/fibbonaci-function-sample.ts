export const fibonacciFunctionSample = `function generateFibonacci(length) {
  const fibonacciSequence = [0, 1];

  for (let i = 2; i < length; i++) {
    const nextFibonacci = fibonacciSequence[i - 1] + fibonacciSequence[i - 2];
    fibonacciSequence.push(nextFibonacci);
  }

  return fibonacciSequence;
}

export default (params) => {
  const { input } = params;
  const num = Number(input);

  const length = Number(input);
  const fibonacciNumbers = generateFibonacci(length);
  return fibonacciNumbers.join(" ")
}
`
