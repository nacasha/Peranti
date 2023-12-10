import { useEffect, useRef } from "react"

const useClickOutside = <T extends HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  callback: () => void
) => {
  const isMounted = useRef(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMounted.current && ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      } else {
        isMounted.current = true
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      isMounted.current = false
      document.removeEventListener("click", handleClickOutside)
    }
  }, [ref, callback])
}

export default useClickOutside
