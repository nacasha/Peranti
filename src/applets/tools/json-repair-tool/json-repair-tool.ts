import { jsonrepair } from "jsonrepair"

import { AppletConstructor } from "src/models/AppletConstructor"
import { type InputFieldsType } from "src/types/InputFieldsType"
import { type OutputFieldsType } from "src/types/OutputFieldsType"

interface InputFields {
  input: InputFieldsType.Code
}

interface OutputFields {
  output: OutputFieldsType.Code
}

interface Options {
  format: InputFieldsType.Select
  unwrapString: InputFieldsType.Switch
}

/**
 * Stringified JSON nests this deep at most before it is left as a string
 */
const MAX_UNWRAP_DEPTH = 5

/**
 * Parse the JSON inside a string value, such as `"{\"a\":1}"` copied from a
 * log line, as long as it holds an object or array
 */
function unwrapJsonString(value: unknown): unknown {
  let current = value
  for (let depth = 0; depth < MAX_UNWRAP_DEPTH && typeof current === "string"; depth++) {
    const text = current.trim()
    if (!text.startsWith("{") && !text.startsWith("[")) {
      break
    }
    try {
      current = JSON.parse(jsonrepair(text))
    } catch {
      break
    }
  }
  return current
}

export const jsonRepairTool = new AppletConstructor<InputFields, OutputFields, Options>({
  appletId: "json-repair",
  fileExtensions: ["json"],
  name: "JSON Repair",
  description: "Fix broken JSON: trailing commas, comments, single quotes, unquoted keys, Python values, escaped strings and more",
  category: "JSON",
  inputFields: [
    {
      key: "input",
      label: "Broken JSON",
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
      label: "Repaired JSON",
      component: "Code",
      props: {
        language: "json"
      },
      hideInHistory: true
    }
  ],
  options: [
    {
      key: "format",
      label: "Output Format",
      component: "Select",
      defaultValue: "pretty",
      props: {
        options: [
          { label: "Pretty", value: "pretty" },
          { label: "Minify", value: "minify" }
        ]
      }
    },
    {
      key: "unwrapString",
      label: "Unwrap Stringified JSON",
      component: "Switch",
      defaultValue: "on",
      props: {
        options: [
          { value: "on", label: "On" },
          { value: "off", label: "Off" }
        ]
      }
    }
  ],
  samples: [
    {
      name: "JavaScript Object",
      inputValues: {
        input: "// user from the API\n{\n  id: 42,\n  name: 'Ann',\n  tags: ['admin', 'dev',],\n  address: { city: \"Oslo\" },\n}"
      }
    },
    {
      name: "Python Dict",
      inputValues: {
        input: "{'id': 42, 'active': True, 'manager': None, 'scores': [1.5, 2, 3]}"
      }
    },
    {
      name: "Escaped String From Logs",
      inputValues: {
        input: "\"{\\\"event\\\":\\\"transfer\\\",\\\"amount\\\":150000,\\\"meta\\\":{\\\"channel\\\":\\\"app\\\"}}\""
      }
    },
    {
      name: "Truncated",
      inputValues: {
        input: "{\"items\": [{\"id\": 1, \"name\": \"first\"}, {\"id\": 2, \"name\": \"sec"
      }
    },
    {
      name: "Newline Delimited",
      inputValues: {
        input: "{\"id\": 1, \"level\": \"info\"}\n{\"id\": 2, \"level\": \"error\"}\n{\"id\": 3, \"level\": \"info\"}"
      }
    }
  ],
  action: ({ inputValues, options }) => {
    const { input } = inputValues
    const { format, unwrapString } = options

    if (input.trim().length === 0) {
      return { output: "" }
    }

    let value: unknown = JSON.parse(jsonrepair(input))
    if (unwrapString === "on") {
      value = unwrapJsonString(value)
    }

    return {
      output: format === "minify" ? JSON.stringify(value) : JSON.stringify(value, null, 2)
    }
  }
})
