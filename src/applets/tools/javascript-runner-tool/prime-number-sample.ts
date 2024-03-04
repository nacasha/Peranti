export const primeNumberSample = `function isPrime(number) {
  if (number < 2) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) {
      return false;
    }
  }

  return true;
}

export default (params) => {
  const { input } = params;
  const num = Number(input);

  if (isPrime(num)) {
    return \`\${num} is a prime number\`;
  } else {
    return \`\${num} is not a prime number\`;
  }
}
`
