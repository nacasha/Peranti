import { type FC, useEffect } from "react"
import { interfaceStore } from "src/store/interfaceStore"

export const AppWindowSizeListener: FC = () => {
  useEffect(() => {
    const onResize = () => {
      interfaceStore.recalculateWindowSize()
    }

    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return null
}
