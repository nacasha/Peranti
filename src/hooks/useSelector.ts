import { autorun } from "mobx"
import { useEffect, useState } from "react"

export function useSelector<T extends () => any, P = ReturnType<T>>(select: T): P {
  const [selected, setSelected] = useState<T>(select)
  useEffect(() => autorun(() => { setSelected(select()) }), [])
  return (selected as unknown) as P
}
