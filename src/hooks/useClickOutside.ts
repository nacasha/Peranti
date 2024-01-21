import { useEffect, useRef } from "react"

const useClickOutside = <T extends HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  callback: () => void
) => {
  const isMounted = useRef(false)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (isMounted.current && ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      } else {
        isMounted.current = true
      }
    }

    document.addEventListener("click", onClickOutside)

    return () => {
      isMounted.current = false
      document.removeEventListener("click", onClickOutside)
    }
  }, [ref, callback])
}

export default useClickOutside
