import { httpClient } from "src/services/httpClient"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  websiteUrl: InputFieldsType.Text
  runner: InputFieldsType.Run
}

interface OutputFields {
  output: OutputFieldsType.Image
}

async function getFavicon(url: any) {
  // Make a request to the website's root
  const response = await httpClient.get(`https://www.google.com/s2/favicons?domain=${url}&sz=180`, {
    responseType: "arraybuffer"
  })

  return response
}

const faviconGrabberTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "favicon-grabber-tool",
  name: "Favicon Grabber",
  category: "Image",
  autoRun: false,
  layoutSetting: {
    direction: "vertical",
    gridTemplate: "auto 1fr"
  },
  inputFields: [
    {
      key: "websiteUrl",
      label: "Website URL",
      component: "Text",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    },
    {
      key: "runner",
      label: "Grab Favicon",
      component: "Run",
      defaultValue: ""
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Image",
      props: {
        width: 150
      }
    }
  ],
  action: async(inputParams) => {
    const { websiteUrl } = inputParams
    const result = await getFavicon(websiteUrl)

    const binaryArray = (result?.data ?? []) as number[]
    const base64String = btoa(String.fromCharCode.apply(null, binaryArray))
    const dataUrl = `data:image/png;base64,${base64String}`

    return { output: dataUrl }
  }
}

export default faviconGrabberTool
