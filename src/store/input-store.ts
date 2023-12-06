import { createStore } from '@udecode/zustood'
import { ToolRunTypeEnum } from '../enums/ToolRunTypeEnum'

const inputStore = createStore('input')({
  params: {} as Record<string, any>,
  runType: ToolRunTypeEnum.OnBlur
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
