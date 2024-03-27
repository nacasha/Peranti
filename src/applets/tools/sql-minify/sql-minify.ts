import minify from "pg-minify"

import { AppletConstructor } from "src/models/AppletConstructor"

const sqlMinifyTool = new AppletConstructor({
  appletId: "sql-minify",
  name: "SQL Minify",
  description: "Minifies PostgreSQL scripts",
  category: "SQL",
  inputFields: [
    {
      key: "sql",
      label: "SQL",
      component: "Code",
      defaultValue: "",
      props: {
        language: "sql"
      }
    }
  ],
  outputFields: [
    {
      key: "output",
      label: "Output",
      component: "Code",
      props: {
        language: "sql"
      }
    }
  ],
  options: [
    {
      key: "compress",
      label: "Compress",
      component: "Checkbox",
      defaultValue: false
    },
    {
      key: "removeAll",
      label: "Remove All",
      component: "Checkbox",
      defaultValue: false
    }
  ],
  action({ inputValues, options }) {
    const { sql } = inputValues
    const output = minify(sql, options)
    return { output }
  }
})

export default sqlMinifyTool
