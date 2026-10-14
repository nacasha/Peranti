/**
 * Compare two CSV cells for sorting. `sign` flips the direction,
 * empty or non-numeric cells always sort last.
 */
export function compareCsvValues(a: string, b: string, compareAs: string, sign: number) {
  if (compareAs === "number") {
    const numberA = a.trim() === "" ? NaN : Number(a)
    const numberB = b.trim() === "" ? NaN : Number(b)
    if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
      return Number(Number.isNaN(numberA)) - Number(Number.isNaN(numberB))
    }
    return (numberA - numberB) * sign
  }

  if (a === "" || b === "") {
    return Number(a === "") - Number(b === "")
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }) * sign
}
