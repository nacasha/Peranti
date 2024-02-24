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
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' min-content"
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
  samples: [
    {
      name: "Current Date",
      inputValues: () => ({
        date: dayjs().format("YYYY-MM-DD")
      })
    },
    {
      name: "Current Datetime",
      inputValues: () => ({
        date: dayjs().format("YYYY-MM-DD HH:mm:ss")
      })
    },
    {
      name: "Batch Sample",
      isBatchModeEnabled: true,
      inputValues: {
        date: "2024-02-15\n2024-02-15 01:01:01\n2024-02-15 23:59:59"
      }
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
