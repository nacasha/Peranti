import { type IEqualsComparer, reaction } from "mobx"
import { useEffect, useState } from "react"

/**
 * Pass `equals` (e.g. `comparer.structural`) when `select` builds a new
 * object / array on each run, so equal results don't re-render the component
 */
export function useSelector<P>(select: () => P, equals?: IEqualsComparer<P>): P {
  const [selected, setSelected] = useState<P>(select)
  useEffect(() => reaction(select, (value) => { setSelected(() => value) }, { equals, fireImmediately: true }), [])
  return selected
}
