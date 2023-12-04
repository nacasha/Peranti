interface Params {
  input: string;
}

export default function textToUppercase({ input }: Params) {
  return { output: input.toUpperCase() }
}
