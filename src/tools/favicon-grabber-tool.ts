import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { type ToolConstructor } from "src/types/ToolConstructor"

interface InputFields {
  websiteUrl: string
  runner: unknown
}

interface OutputFields {
  output: unknown
}

function getFavicon(url: any, callback: any) {
  // Make a request to the website's root
  fetch(url)
    .then(async response => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return await response.text()
    })
    .then(html => {
      // Parse the HTML to find the favicon link
      const regex = /<link.*?rel=["']icon["'].*?href=["'](.*?)["'].*?>/i
      const match = html.match(regex)

      if (match?.[1]) {
        // If a match is found, pass the favicon URL to the callback
        callback(null, match[1])
      } else {
        callback(new Error("Favicon not found"))
      }
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      callback(error)
    })
}

const faviconGrabberTool: ToolConstructor<InputFields, OutputFields> = {
  toolId: "favicon-grabber-tool",
  name: "Favicon Grabber",
  category: "Image",
  layout: ToolLayoutEnum.SideBySide,
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
      component: "Textarea"
    }
  ],
  action: async(inputParams) => {
    const { websiteUrl } = inputParams

    const result = await new Promise((resolve) => {
      getFavicon(websiteUrl, (error: any, faviconURL: any) => {
        if (error) {
          resolve(error.message)
        } else {
          resolve(faviconURL)
        }
      })
    })

    return { output: result }
  }
}

export default faviconGrabberTool
