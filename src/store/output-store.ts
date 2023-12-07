import { createStore } from "@udecode/zustood"

const outputStore = createStore("output")({
  params: { ehe: "ok" } as Record<string, any>
})
  .extendActions(
    (set) => ({
      setParams: (key: string, value: any) => {
        set.state((draft) => {
          draft.params[key] = value
        })
      },

      resetParams: () => {
        set.params({})
      }
    })
  )

export default outputStore
