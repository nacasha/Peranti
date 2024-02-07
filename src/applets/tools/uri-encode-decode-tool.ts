import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"
import { type AppletConstructor } from "src/types/AppletConstructor"

interface InputFields {
  input: InputFieldsType.Switch
  type: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const uriEncodeDecodeTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "uri-encode-decode",
  name: "URI Encode Decode",
  category: "Encode / Decode",
  inputFields: [
    {
      key: "type",
      label: "Mode",
      component: "Switch",
      defaultValue: "encode",
      skipValidateHasValue: true,
      props: {
        options: [
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" }
        ]
      }
    },
    {
      key: "input",
      label: "Input",
      component: "Code",
      defaultValue: "",
      props: {
        autoFocus: true
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code"
    }
  ],
  action({ input, type }) {
    try {
      if (type === "encode") {
        return { output: encodeURIComponent(input) }
      }

      return { output: decodeURIComponent(input) }
    } catch (error) {
      return { output: "Invalid Input" }
    }
  }
}

export default uriEncodeDecodeTool