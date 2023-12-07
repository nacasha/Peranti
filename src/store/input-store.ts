import { createStore } from "@udecode/zustood"
import { ToolRunTypeEnum } from "src/enums/ToolRunTypeEnum"

const defaultParams: Record<string, any> = {}

const inputStore = createStore("input")({
  params: defaultParams,
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
