import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"

import { AppletConstructor } from "src/models/AppletConstructor"
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

const millisecondsToDate = new AppletConstructor<InputFields, OutputFields>({
  appletId: "milliseconds-to-date",
  name: "Milliseconds To Date",
  category: "Date Time",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' min-content"
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
  samples: [
    {
      name: "Current Millis",
      inputValues: () => ({
        milliseconds: new Date().getTime().toString()
      })
    },
    {
      name: "Batch Sample",
      isBatchModeEnabled: true,
      inputValues: {
        milliseconds: "1694000944625\n1708001926834\n1704000944625"
      }
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
})

export default millisecondsToDate
