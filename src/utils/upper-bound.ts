/**
 * Index of the first value greater than `target` in a sorted array
 */
export function upperBound(values: ArrayLike<number>, target: number) {
  let low = 0
  let high = values.length

  while (low < high) {
    const middle = (low + high) >>> 1
    if (values[middle] <= target) {
      low = middle + 1
    } else {
      high = middle
    }
  }

  return low
}
