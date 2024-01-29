import { httpClient } from "src/services/httpClient"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  startDate: string
  endDate: string
  accounts: string
  startButton: unknown
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const jfsGetThTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "jfs-get-th",
  name: "JFS Get TH",
  category: "JFS",
  autoRun: false,
  layoutSetting: {
    direction: "horizontal"
  },
  inputFields: [
    {
      key: "startDate",
      label: "Start Date",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    },
    {
      key: "endDate",
      label: "End Date",
      component: "Text",
      defaultValue: "",
      allowBatch: true
    },
    {
      key: "accounts",
      label: "Accounts",
      component: "Code",
      defaultValue: "",
      allowBatch: true
    },
    {
      key: "startButton",
      label: "Start",
      component: "Run",
      defaultValue: "",
      allowBatch: true
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "MD5",
      component: "Code",
      allowBatch: true
    }
  ],
  action: async() => {
    // const { startDate, endDate, accounts } = inputParams
    const transactions = []

    try {
      const url = ""
      const response = await httpClient.get(url, {
        headers: {
          Authorization: ""
        }
      })

      const responseData = response.data.data.transactions
      transactions.push(...responseData)

      return { output: transactions.map((t) => JSON.stringify(t)).join("\n") }
    } catch (exception) {
      return { output: `${exception as any}` }
    }
  }
}

export default jfsGetThTool
