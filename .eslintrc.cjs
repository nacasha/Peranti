module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "standard-with-typescript",
    "plugin:react/recommended"
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
      }
    }
  },
  "plugins": [
    "react",
    "import"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
    "react/jsx-closing-tag-location": "warn",
    "react/jsx-closing-bracket-location": ["warn", "tag-aligned"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/quotes": ["error", "double"],
    "import/no-unresolved": "error",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/space-before-function-paren": ["error", "never"],
    "import/order": [
      "warn", {
        "alphabetize": {
          "caseInsensitive": false,
          "order": "asc"
        },
        "warnOnUnassignedImports": true,
        "newlines-between": "always",
        "pathGroups": [
          {
            "pattern": "src/**",
            "group": "internal",
            "position": "after"
          },
          {
            "pattern": "{.,..}/*\.scss",
            "group": "object",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"]
      }
    ]
  }
}
