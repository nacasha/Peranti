import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

dayjs.extend(utc)

interface InputFields {
  milliseconds: InputFieldsType.Text
}

interface OutputFields {
  localDateTime: OutputFieldsType.Text
  utcDateTime: OutputFieldsType.Text
}

const millisecondsToDate: AppletConstructor<InputFields, OutputFields> = {
  appletId: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  layoutSetting: {
    direction: "vertical",
    gridTemplate: "auto 1fr"
  },
  inputFields: [
    {
      key: "milliseconds",
      label: "Milliseconds",
      component: "Text",
      defaultValue: "",
      allowBatch: true,
      props: {
        autoFocus: true
      }
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
  action: ({ inputValues }) => {
    const { milliseconds } = inputValues
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
