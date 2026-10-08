import dayjs from "dayjs"
import dayOfYear from "dayjs/plugin/dayOfYear"
import utc from "dayjs/plugin/utc"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { formatShortRelativeTime } from "src/utils/format-short-relative-time"

dayjs.extend(utc)
dayjs.extend(dayOfYear)

interface InputFields {
  milliseconds: InputFieldsType.Text
}

interface OutputFields {
  seconds: OutputFieldsType.KeyValue
  iso8601: OutputFieldsType.KeyValue
  rfc2822: OutputFieldsType.KeyValue
  localTime: OutputFieldsType.KeyValue
  relativeTime: OutputFieldsType.KeyValue
  dayOfYear: OutputFieldsType.KeyValue
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
      key: "seconds",
      label: "Seconds (Unix)",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "iso8601",
      label: "ISO 8601",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "rfc2822",
      label: "RFC 2822",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "localTime",
      label: "Local time",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "relativeTime",
      label: "Relative",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    },
    {
      key: "dayOfYear",
      label: "Day of year",
      allowBatch: true,
      component: "KeyValue",
      props: { label: "Result" }
    }
  ],
  samples: [
    {
      name: "Current Millis",
      inputValues: () => ({
        milliseconds: new Date().getTime().toString()
      })
    }
  ],
  action: ({ inputValues }) => {
    const { milliseconds } = inputValues
    const time = Number(milliseconds)
    const dayJsInstance = dayjs(time)
    const isValid = milliseconds.trim().length > 0 && dayJsInstance.isValid()

    return {
      seconds: isValid ? `${Math.floor(time / 1000)}` : "",
      iso8601: isValid ? dayJsInstance.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : "",
      rfc2822: isValid ? dayJsInstance.utc().format("ddd, DD MMM YYYY HH:mm:ss [GMT]") : "",
      localTime: isValid ? dayJsInstance.format("YYYY-MM-DD HH:mm:ss") : "",
      relativeTime: isValid ? formatShortRelativeTime(time) : "",
      dayOfYear: isValid ? `${dayJsInstance.dayOfYear()}` : ""
    }
  }
})

export default millisecondsToDate
