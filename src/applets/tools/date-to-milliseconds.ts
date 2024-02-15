import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

dayjs.extend(utc)

interface InputFields {
  date: InputFieldsType.Text
}

interface OutputFields {
  milliseconds: OutputFieldsType.Text
}

const dateToMillisecondsTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "date-to-milliseconds",
  name: "Date To Milliseconds",
  category: "Date Time",
  layoutSetting: {
    direction: "vertical",
    gridTemplate: "auto 1fr"
  },
  inputFields: [
    {
      key: "date",
      label: "Date",
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
      key: "milliseconds",
      label: "Milliseconds",
      component: "Text",
      allowBatch: true
    }
  ],
  action: ({ inputValues }) => {
    const { date } = inputValues
    if (date.trim().length === 0) {
      return { milliseconds: "" }
    }

    const dayJsInstance = dayjs(date)
    const milliseconds = dayJsInstance.valueOf()

    if (Number.isNaN(milliseconds)) {
      return { milliseconds: "Invalid date" }
    }

    return { milliseconds: milliseconds.toString() }
  }
}

export default dateToMillisecondsTool
