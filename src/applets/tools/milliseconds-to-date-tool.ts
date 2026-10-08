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
  result: OutputFieldsType.KeyValue
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
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "result",
      label: "Result",
      component: "KeyValue",
      props: {
        fields: {
          milliseconds: { label: "Milliseconds" },
          seconds: { label: "Seconds (Unix)" },
          iso8601: { label: "ISO 8601" },
          rfc2822: { label: "RFC 2822" },
          localTime: { label: "Local time" },
          relativeTime: { label: "Relative" },
          dayOfYear: { label: "Day of year" }
        }
      }
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

    // Every value stays empty while the input is empty or invalid, so the table keeps its shape
    return {
      result: {
        milliseconds: isValid ? time : "",
        seconds: isValid ? Math.floor(time / 1000) : "",
        iso8601: isValid ? dayJsInstance.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]") : "",
        rfc2822: isValid ? dayJsInstance.utc().format("ddd, DD MMM YYYY HH:mm:ss [GMT]") : "",
        localTime: isValid ? dayJsInstance.format("YYYY-MM-DD HH:mm:ss") : "",
        relativeTime: isValid ? formatShortRelativeTime(time) : "",
        dayOfYear: isValid ? dayJsInstance.dayOfYear() : ""
      }
    }
  }
})

export default millisecondsToDate
