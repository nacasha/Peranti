export const diamondFunctionSample = `function generateDiamond(rows) {
  if (rows % 2 === 0) {
    return "Please provide an odd number of rows for a symmetrical diamond.";
  }

  const midPoint = Math.floor(rows / 2) + 1;
  let diamondString = "";

  for (let i = 1; i <= midPoint; i++) {
    let spaces = " ".repeat(midPoint - i);
    let stars = "*".repeat(2 * i - 1);
    diamondString += spaces + stars + "\\n";
  }

  for (let i = midPoint - 1; i >= 1; i--) {
    let spaces = " ".repeat(midPoint - i);
    let stars = "*".repeat(2 * i - 1);
    diamondString += spaces + stars + "\\n";
  }

  return diamondString;
}

export default (params) => {
  const { input } = params;
  const diamondRows = Number(input);
  return generateDiamond(diamondRows);
}
`
