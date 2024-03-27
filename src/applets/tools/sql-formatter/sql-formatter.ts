import { format } from "sql-formatter"

import { AppletConstructor } from "src/models/AppletConstructor"

const sqlFormatterTool = new AppletConstructor({
  appletId: "sql-formatter",
  name: "SQL Formatter",
  description: "Pretty-printing SQL queries with format: GCP BigQuery, IBM DB2, Apache Hive, MariaDB, MySQL, TiDB, Couchbase N1QL, Oracle PL/SQL, PostgreSQL, Amazon Redshift, SingleStoreDB, Snowflake, Spark, SQL Server Transact-SQL, Trino (and Presto)",
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
      key: "language",
      component: "Select",
      label: "Language",
      defaultValue: "sql",
      props: {
        options: [
          { value: "sql", label: "Standard SQL" },
          { value: "bigquery", label: "GCP BigQuery" },
          { value: "db2", label: "IBM DB2" },
          { value: "db2i", label: "IBM DB2i (experimental)" },
          { value: "hive", label: "Apache Hive" },
          { value: "mariadb", label: "MariaDB" },
          { value: "mysql", label: "MySQL" },
          { value: "tidb", label: "TiDB" },
          { value: "n1ql", label: "Couchbase N1QL" },
          { value: "plsql", label: "Oracle PL/SQL" },
          { value: "postgresql", label: "PostgreSQL" },
          { value: "redshift", label: "Amazon Redshift" },
          { value: "singlestoredb", label: "SingleStoreDB" },
          { value: "snowflake", label: "Snowflake" },
          { value: "spark", label: "Spark" },
          { value: "sqlite", label: "SQLite" },
          { value: "transactsql", label: "SQL Server Transact-SQL" },
          { value: "trino", label: "Trino" }
        ]
      }
    },
    {
      key: "tabWidth",
      label: "Tab Width",
      component: "Text",
      defaultValue: "2",
      props: {
        type: "number"
      }
    },
    {
      key: "useTabs",
      label: "Use Tabs",
      component: "Checkbox",
      defaultValue: false
    },
    {
      key: "keywordCase",
      label: "Keyword Case",
      component: "Select",
      defaultValue: "preserve",
      props: {
        options: [
          { value: "preserve", label: "Preserve" },
          { value: "upper", label: "Upper" },
          { value: "lower", label: "Lower" }
        ]
      }
    },
    {
      key: "dataTypeCase",
      label: "Data Type Case",
      component: "Select",
      defaultValue: "preserve",
      props: {
        options: [
          { value: "preserve", label: "Preserve" },
          { value: "upper", label: "Upper" },
          { value: "lower", label: "Lower" }
        ]
      }
    },
    {
      key: "functionCase",
      label: "Function Case",
      component: "Select",
      defaultValue: "preserve",
      props: {
        options: [
          { value: "preserve", label: "Preserve" },
          { value: "upper", label: "Upper" },
          { value: "lower", label: "Lower" }
        ]
      }
    },
    {
      key: "identifierCase",
      label: "Identifier Case",
      component: "Select",
      defaultValue: "preserve",
      props: {
        options: [
          { value: "preserve", label: "Preserve" },
          { value: "upper", label: "Upper" },
          { value: "lower", label: "Lower" }
        ]
      }
    },
    {
      key: "indentStyle",
      label: "Indent Style",
      component: "Select",
      defaultValue: "standard",
      props: {
        options: [
          { value: "standard", label: "Standard" },
          { value: "tabularLeft", label: "Tabular Left" },
          { value: "tabularRight", label: "Tabular Right" }
        ]
      }
    },
    {
      key: "logicalOperatorNewline",
      label: "AND/OR newlines",
      component: "Select",
      defaultValue: "before",
      props: {
        options: [
          { value: "before", label: "Before" },
          { value: "after", label: "After" }
        ]
      }
    },
    {
      key: "expressionWidth",
      label: "Expression Width",
      component: "Text",
      defaultValue: "50",
      props: {
        type: "number",
        min: 1
      }
    },
    {
      key: "linesBetweenQueries",
      label: "Lines between queries",
      component: "Text",
      defaultValue: "4",
      props: {
        type: "number",
        min: 0,
        max: 5
      }
    },
    {
      key: "denseOperators",
      label: "Dense Operators",
      component: "Checkbox",
      defaultValue: false
    },
    {
      key: "newlineBeforeSemicolon",
      label: "Semicolon on separate line",
      component: "Checkbox",
      defaultValue: false
    }
  ],
  action({ inputValues, options }) {
    const { sql } = inputValues
    const output = format(sql, { ...options, expressionWidth: Number(options.expressionWidth) })
    return { output }
  }
})

export default sqlFormatterTool
