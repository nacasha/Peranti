import cronParser from "cron-parser"
import cronstrue from "cronstrue"

import { AppletConstructor } from "src/models/AppletConstructor"

const cronReadableTool = new AppletConstructor({
  appletId: "cron-parser",
  name: "CRON Parser",
  category: "Date Time",
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' auto"
  },
  inputFields: [
    {
      key: "input",
      label: "CRON Expression",
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
      key: "output",
      label: "Output",
      component: "Text",
      allowBatch: true
    },
    {
      key: "schedule",
      label: "Next Schedule",
      component: "Code"
    }
  ],
  samples: [
    {
      name: "Sample 1",
      inputValues: {
        input: "* * * * *"
      }
    },
    {
      name: "Sample 2",
      inputValues: {
        input: "0 0/30 * * * *"
      }
    },
    {
      name: "Sample 3",
      inputValues: {
        input: "0 08-17 * * 5-7"
      }
    },
    {
      name: "Batch Sample",
      isBatchModeEnabled: true,
      inputValues: {
        input: "0 0 * * * *\n0 08-17 * * 5-0\n0 0/30 * * * *"
      }
    }
  ],
  action: ({ inputValues }) => {
    const { input } = inputValues
    if (input.trim().length === 0) {
      return { output: "" }
    }

    try {
      const output = cronstrue.toString(input)
      const interval = cronParser.parseExpression(input)

      const generatedInterval = []
      for (let index = 0; index < 10; index++) {
        generatedInterval.push(interval.next().toString())
      }

      return { output, schedule: generatedInterval.join("\n") }
    } catch (error) {
      return { output: "Invalid CRON Format", schedule: "Invalid CRON Format" }
    }
  }
})

export default cronReadableTool
