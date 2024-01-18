import { ResponseType, fetch } from "@tauri-apps/api/http"

import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  websiteUrl: string
  runner: unknown
}

interface OutputFields {
  output: OutputFieldsType.Image
}

async function getFavicon(url: any) {
  // Make a request to the website's root
  const response = await fetch(`https://www.google.com/s2/favicons?domain=${url}&sz=180`, {
    method: "GET",
    timeout: 30,
    responseType: ResponseType.Binary
  })

  return response
}

const faviconGrabberTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "favicon-grabber-tool",
  name: "Favicon Grabber",
  category: "Image",
  autoRun: false,
  inputFields: [
    {
      key: "websiteUrl",
      label: "Website URL",
      component: "Text",
      defaultValue: ""
    },
    {
      key: "runner",
      label: "Grab Favicon",
      component: "Button",
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
