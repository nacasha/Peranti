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
    "import",
    "n"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
    "react/jsx-closing-tag-location": "warn",
    "react/jsx-closing-bracket-location": ["warn", "tag-aligned"],
    "react/display-name": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        "MemberExpression": 1,
        "ignoredNodes": [
          "FunctionExpression > .params[decorators.length > 0]",
          "FunctionExpression > .params > :matches(Decorator, :not(:first-child))",
          "ClassBody.body > PropertyDefinition[decorators.length > 0] > .key",
        ],
      }
    ],
    "@typescript-eslint/quotes": ["error", "double"],
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/space-before-function-paren": ["error", "never"],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "import/no-unresolved": "error",
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
    ],
    "n/file-extension-in-import": [
      "error",
      "always",
    ]
  }
}
