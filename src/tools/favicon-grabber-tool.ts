import { ResponseType, fetch } from "@tauri-apps/api/http"

import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  websiteUrl: string
  runner: unknown
}

interface OutputFields {
  output: unknown
}

async function getFavicon(url: any) {
  // Make a request to the website's root
  const response = await fetch(`https://www.google.com/s2/favicons?domain=${url}&sz=128`, {
    method: "GET",
    timeout: 30,
    responseType: ResponseType.Text
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
      component: "ImageBinary"
    }
  ],
  action: async(inputParams) => {
    const { websiteUrl } = inputParams
    const result = await getFavicon(websiteUrl)
    console.log(result)

    return { output: result?.data }
  }
}

export default faviconGrabberTool
