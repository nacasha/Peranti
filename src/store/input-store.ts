import { createStore } from '@udecode/zustood'

const inputStore = createStore('input')({
  params: {} as Record<string, any>,
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


export default inputStore
