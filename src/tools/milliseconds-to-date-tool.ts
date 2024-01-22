import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

dayjs.extend(utc)

interface InputFields {
  milliseconds: InputFieldsType.Text
}

interface OutputFields {
  localDateTime: OutputFieldsType.Text
  utcDateTime: OutputFieldsType.Text
}

const millisecondsToDate: ToolConstructor<InputFields, OutputFields> = {
  toolId: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  layoutSetting: {
    direction: "vertical",
    inputAreaSize: "auto"
  },
  inputFields: [
    {
      key: "milliseconds",
      label: "Milliseconds",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    }
  ],
  outputFields: [
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
}

export default millisecondsToDate
