import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { Tool } from "src/models/Tool"

dayjs.extend(utc)

interface InputParams {
  milliseconds: string
}

interface OutputFields {
  localDateTime: unknown
  utcDateTime: unknown
}

const millisecondsToDate = new Tool<InputParams, OutputFields>({
  toolId: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  layout: ToolLayoutEnum.TopBottomAndPushToTop,
  inputs: [
    {
      key: "milliseconds",
      label: "Milliseconds",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    }
  ],
  outputs: [
    {
      key: "utcDateTime",
      label: "UTC Date Time",
      component: "Text",
      allowBatch: true
    },
    {
      key: "localDateTime",
      label: "Local Date Time",
      component: "Text",
      allowBatch: true
    }
  ],
  action: (inputParams) => {
    const { milliseconds } = inputParams
    if (milliseconds.trim().length === 0) {
      return { localDateTime: "", utcDateTime: "" }
    }

    const dayJsInstance = dayjs(Number(milliseconds))

    const localDateTime = dayJsInstance.format("YYYY-MM-DD HH:mm:ss")
    const utcDateTime = dayJsInstance.utc().format("YYYY-MM-DD HH:mm:ss")

    return { utcDateTime, localDateTime }
  }
})

export default millisecondsToDate
