import { AppletConstructor } from "src/models/AppletConstructor"
import { httpClient } from "src/services/http-client"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  websiteUrl: InputFieldsType.Text
  runner: InputFieldsType.Run
}

interface OutputFields {
  output: OutputFieldsType.Image
}

async function getFavicon(url: any) {
  return await httpClient(`https://www.google.com/s2/favicons?domain=${url}&sz=180`, {
    method: "GET"
  })
}

const faviconGrabberTool = new AppletConstructor<InputFields, OutputFields>({
  appletId: "favicon-grabber-tool",
  name: "Favicon Grabber",
  category: "Image",
  autoRun: false,
  layoutSetting: {
    areaType: "grid",
    areaGridTemplate: "'input' min-content 'output' 1fr"
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
      label: "Favicon",
      component: "Image",
      props: {
        width: 150
      }
    }
  ],
  samples: [
    {
      name: "Google",
      inputValues: { websiteUrl: "google.com" }
    },
    {
      name: "Facebook",
      inputValues: { websiteUrl: "facebook.com" }
    },
    {
      name: "Youtube",
      inputValues: { websiteUrl: "youtube.com" }
    }
  ],
  action: async({ inputValues }) => {
    const { websiteUrl } = inputValues
    const arrayBuffer = await getFavicon(websiteUrl)

    console.log(arrayBuffer)

    if (arrayBuffer) {
      const base64String = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))))
      const dataUrl = `data:image/png;base64,${base64String}`

      return { output: dataUrl }
    }

    return { output: "" }
  }
})

export default faviconGrabberTool
