import { type AppletConstructor } from "src/types/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  type: InputFieldsType.Switch
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

const base64EncodeDecodeTool: AppletConstructor<InputFields, OutputFields> = {
  appletId: "base64-encode-decode",
  name: "Base64 Encode Decode",
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
  action({ inputValues }) {
    const { input, type } = inputValues
    try {
      if (type === "encode") {
        return { output: btoa(input) }
      }
      return { output: atob(input) }
    } catch (error) {
      if (type === "encode") {
        return { output: "Unable to encode text" }
      }
      return { output: "Unable to decode text" }
    }
  }
}

export default base64EncodeDecodeTool
