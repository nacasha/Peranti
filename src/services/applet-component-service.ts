import { open } from "@tauri-apps/plugin-dialog"
import toast from "react-hot-toast"

import { ColorHistory } from "src/components/history/ColorHistory"
import { ColorPalleteHistory } from "src/components/history/ColorPalleteHistory"
import { FileHistory } from "src/components/history/FileHistory"
import { GridStatHistory } from "src/components/history/GridStatHistory"
import { ImageHistory } from "src/components/history/ImageHistory"
import { RunInput } from "src/components/inputs/ButtonInput"
import { CheckboxInput } from "src/components/inputs/CheckboxInput"
import { CodeInput } from "src/components/inputs/CodeInput"
import { ColorPickerInput } from "src/components/inputs/ColorPickerInput"
import { DateTimeInput } from "src/components/inputs/DateTimeInput"
import { FileInput, FilesInput } from "src/components/inputs/FileInput"
import { ListPickInput } from "src/components/inputs/ListPickInput"
import { ListReorderInput } from "src/components/inputs/ListReorderInput"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SwitchInput } from "src/components/inputs/SwitchInput"
import { TextAreaInput } from "src/components/inputs/TextAreaInput-2"
import { TextInput } from "src/components/inputs/TextInput"
import { CodeOutput } from "src/components/outputs/CodeOutput"
import { ColorOutput } from "src/components/outputs/ColorOutput"
import { ColorPalleteOutput } from "src/components/outputs/ColorPalleteOutput"
import { DataGridOutput } from "src/components/outputs/DataGridOutput"
import { DiffOutput } from "src/components/outputs/DiffOutput"
import { FileOutput } from "src/components/outputs/FileOutput"
import { GridStatOutput } from "src/components/outputs/GridStatOutput"
import { IFrameOutput } from "src/components/outputs/IFrameOutput"
import { ImageOutput } from "src/components/outputs/ImageOutput"
import { KeyValueOutput } from "src/components/outputs/KeyValueOutput"
import { MarkdownOutput } from "src/components/outputs/MarkdownOutput"
import { MermaidOutput } from "src/components/outputs/MermaidOutput"
import { PintoraOutput } from "src/components/outputs/PintoraOutput"
import { ReactOutput } from "src/components/outputs/ReactOutput"
import { TextAreaOutput } from "src/components/outputs/TextAreaOutput-2"
import { TextOutput } from "src/components/outputs/TextOutput"
import { AppletComponent } from "src/models/AppletComponent.js"
import { ExtensionPage } from "src/pages/ExtensionPage"
import { ExtensionsPage } from "src/pages/ExtensionsPage"
import { HistoryPage } from "src/pages/HistoryPage"
import { PipelineEditor } from "src/pages/PipelineEditorPage"
import { SettingsPage } from "src/pages/SettingsPage"
import { WorkbenchPage } from "src/pages/WorkbenchPage"
import { createFileFromUint32Array } from "src/utils/file/create-file-from-uint32-array.js"
import { getFileNameFromPath } from "src/utils/file/get-file-name-from-path.js"
import { convertCRLFtoLF } from "src/utils/text/convert-crlf-to-lf.js"

import { extensionComponentRegistry } from "./extension-component-registry.tsx"
import { fileService } from "./file-service.js"

class AppletComponentService {
  /**
   * Map of key and input components
   */
  readonly inputs = {
    Checkbox: new AppletComponent({
      component: CheckboxInput,
      value: {
        type: "boolean",
        example: true
      },
      hideInHistory: true
    }),

    TextArea: new AppletComponent({
      component: TextAreaInput,
      value: {
        type: "string",
        description: "Text, may hold several lines",
        example: "line 1\nline 2"
      },
      props: [
        {
          name: "autoFocus",
          type: "boolean",
          default: false,
          description: "Focused when the tab opens"
        },
        {
          name: "placeholder",
          type: "string",
          description: "Hint shown while empty",
          example: "Type here"
        }
      ],
      maximizable: true,
      copyAs: "text",
      saveAs: "text",
      readFileAs: "text"
    }),

    Text: new AppletComponent({
      component: TextInput,
      props: [
        {
          name: "type",
          type: "string",
          default: "text",
          options: [
            "text",
            "number",
            "email",
            "url",
            "password",
            "search",
            "tel"
          ],
          description: "Kind of text box"
        },
        {
          name: "placeholder",
          type: "string",
          description: "Hint shown while empty",
          example: "Type here"
        },
        {
          name: "autoFocus",
          type: "boolean",
          default: false,
          description: "Focused when the tab opens"
        }
      ],
      value: {
        type: "string",
        description: "One line of text",
        example: "hello"
      },
      batchComponent: "Code",
      copyAs: "text"
    }),

    DateTime: new AppletComponent({
      component: DateTimeInput,
      props: [
        {
          name: "autoFocus",
          type: "boolean",
          default: false,
          description: "Focused when the tab opens"
        }
      ],
      value: {
        type: "string",
        description: "Date, with the time only when one is picked; empty when cleared",
        example: "2026-10-12 14:30:00"
      },
      batchComponent: "Code",
      copyAs: "text"
    }),

    ListReorder: new AppletComponent({
      component: ListReorderInput,
      props: [
        {
          name: "items",
          type: "array",
          required: true,
          description: "Labels of the items to reorder, often set by computedProps",
          example: [
            "Apple",
            "Banana",
            "Cherry"
          ]
        }
      ],
      value: {
        type: "json-string",
        description: "New order as item indexes, items come from props.items",
        example: "[2, 0, 1, 3]"
      },
      exampleProps: {
        items: ["Apple", "Banana", "Cherry", "Durian"]
      },
      hideInHistory: true
    }),

    ListPick: new AppletComponent({
      component: ListPickInput,
      props: [
        {
          name: "items",
          type: "array",
          required: true,
          description: "Labels of the items to tick, often set by computedProps",
          example: [
            "Apple",
            "Banana",
            "Cherry"
          ]
        },
        {
          name: "selection",
          type: "string",
          default: "exclude",
          options: [
            "exclude",
            "include"
          ],
          description: "Whether the value lists the unticked items or the ticked ones"
        }
      ],
      value: {
        type: "json-string",
        description: "Indexes of the unticked items, or the ticked ones with props.selection \"include\". Items come from props.items",
        example: "[1, 3]"
      },
      exampleProps: {
        items: ["Apple", "Banana", "Cherry", "Durian"]
      },
      hideInHistory: true
    }),

    Select: new AppletComponent({
      component: SelectInput,
      props: [
        {
          name: "options",
          type: "array",
          required: true,
          description: "List of { label, value }, value is what the field sends",
          example: [
            {
              label: "UTF-8",
              value: "utf8"
            },
            {
              label: "ASCII",
              value: "ascii"
            }
          ]
        }
      ],
      value: {
        type: "string",
        description: "Value of the picked option in props.options",
        example: "utf8"
      },
      hideInHistory: true
    }),

    Switch: new AppletComponent({
      component: SwitchInput,
      props: [
        {
          name: "options",
          type: "array",
          required: true,
          description: "List of { label, value }, value is what the field sends",
          example: [
            {
              label: "Upper",
              value: "upper"
            },
            {
              label: "Lower",
              value: "lower"
            }
          ]
        }
      ],
      value: {
        type: "string",
        description: "Value of the picked option in props.options",
        example: "upper"
      },
      hideInHistory: true
    }),

    Run: new AppletComponent({
      component: RunInput,
      value: {
        type: "none",
        description: "A button that runs the tool"
      },
      hideInHistory: true
    }),

    File: new AppletComponent({
      component: FileInput,
      props: [
        {
          name: "accept",
          type: "string",
          description: "File types to allow, like the HTML accept attribute",
          example: "image/*,.pdf"
        },
        {
          name: "maxSize",
          type: "number",
          description: "Largest file in bytes",
          example: 10485760
        }
      ],
      value: {
        type: "file",
        description: "A browser File, or null when cleared. Not JSON"
      },
      readFileAs: "file",
      historyComponent: FileHistory
    }),

    Files: new AppletComponent({
      component: FilesInput,
      props: [
        {
          name: "accept",
          type: "string",
          description: "File types to allow, like the HTML accept attribute",
          example: "image/*,.pdf"
        },
        {
          name: "maxSize",
          type: "number",
          description: "Largest file in bytes",
          example: 10485760
        }
      ],
      value: {
        type: "files",
        description: "A list of browser Files. Not JSON"
      },
      readFileAs: "files",
      historyComponent: FileHistory
    }),

    Code: new AppletComponent({
      component: CodeInput,
      props: [
        {
          name: "language",
          type: "string",
          default: "plain",
          options: [
            "plain",
            "json",
            "javascript",
            "markdown",
            "yaml",
            "sql"
          ],
          description: "Highlighting"
        },
        {
          name: "autoFocus",
          type: "boolean",
          default: false,
          description: "Focused when the tab opens"
        },
        {
          name: "placeholder",
          type: "string",
          description: "Hint shown while empty",
          example: "Type here"
        }
      ],
      value: {
        type: "string",
        description: "Source text, props.language sets the highlighting",
        example: "{ \"a\": 1 }"
      },
      maximizable: true,
      copyAs: "text",
      saveAs: "text",
      readFileAs: "text"
    }),

    PipelineEditor: new AppletComponent({
      component: PipelineEditor,
      hideInHistory: true
    }),

    Settings: new AppletComponent({
      component: SettingsPage,
      hideInHistory: true
    }),

    History: new AppletComponent({
      component: HistoryPage,
      hideInHistory: true
    }),

    Extensions: new AppletComponent({
      component: ExtensionsPage,
      hideInHistory: true
    }),

    Workbench: new AppletComponent({
      component: WorkbenchPage,
      hideInHistory: true
    }),

    ExtensionPage: new AppletComponent({
      component: ExtensionPage,
      hideInHistory: true
    }),

    ColorPicker: new AppletComponent({
      component: ColorPickerInput,
      value: {
        type: "string",
        description: "Hex color",
        example: "#3b82f6"
      },
      maximizable: true,
      historyComponent: ColorHistory
    })
  }

  /**
   * Map of key and output components
   */
  readonly outputs = {
    Code: new AppletComponent({
      component: CodeOutput,
      props: [
        {
          name: "language",
          type: "string",
          default: "plain",
          options: [
            "plain",
            "json",
            "javascript",
            "markdown",
            "yaml",
            "sql"
          ],
          description: "Highlighting"
        }
      ],
      value: {
        type: "any",
        description: "Text as is, anything else shown as indented JSON",
        example: {
          a: 1
        }
      },
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    // Both sides of the diff are already the tab's inputs
    Diff: new AppletComponent({
      component: DiffOutput,
      props: [
        {
          name: "splitView",
          type: "boolean",
          default: true,
          description: "Both texts side by side, or one merged view"
        },
        {
          name: "compareMethod",
          type: "string",
          default: "diffChars",
          options: [
            "diffChars",
            "diffWords",
            "diffWordsWithSpace",
            "diffLines",
            "diffTrimmedLines",
            "diffSentences",
            "diffCss"
          ],
          description: "What counts as one change"
        },
        {
          name: "leftTitle",
          type: "string",
          description: "Title above the old text",
          example: "Before"
        },
        {
          name: "rightTitle",
          type: "string",
          description: "Title above the new text",
          example: "After"
        }
      ],
      value: {
        type: "object",
        description: "Two texts to compare: { oldCode, newCode }",
        example: {
          oldCode: "a\nb",
          newCode: "a\nc"
        },
        fields: [
          {
            name: "oldCode",
            type: "string",
            required: true,
            description: "Text before, shown on the left"
          },
          {
            name: "newCode",
            type: "string",
            required: true,
            description: "Text after, shown on the right"
          }
        ]
      },
      maximizable: true,
      hideInHistory: true
    }),

    File: new AppletComponent({
      component: FileOutput,
      value: {
        type: "string",
        description: "URL or path of a document to view",
        example: "https://example.com/file.pdf"
      },
      hideInHistory: true
    }),

    GridStat: new AppletComponent({
      component: GridStatOutput,
      value: {
        type: "array",
        description: "Stats as [{ label, value }], or that list as JSON text",
        example: [
          {
            label: "Words",
            value: 12
          },
          {
            label: "Lines",
            value: 3
          }
        ],
        fields: [
          {
            name: "label",
            type: "string",
            required: true,
            description: "Name of the stat"
          },
          {
            name: "value",
            type: "any",
            required: true,
            description: "Its value, a string or a number"
          }
        ]
      },
      historyComponent: GridStatHistory
    }),

    IFrame: new AppletComponent({
      component: IFrameOutput,
      value: {
        type: "none",
        description: "Ignores its value"
      },
      hideInHistory: true
    }),

    Image: new AppletComponent({
      component: ImageOutput,
      value: {
        type: "string",
        description: "Anything an <img src> takes, such as a data URL",
        example: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><rect width='80' height='40' fill='%233b82f6'/></svg>"
      },
      maximizable: true,
      saveAs: "image",
      historyComponent: ImageHistory
    }),

    Markdown: new AppletComponent({
      component: MarkdownOutput,
      value: {
        type: "string",
        description: "Markdown source",
        example: "# Title\n\nSome **bold** text"
      },
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    TextArea: new AppletComponent({
      component: TextAreaOutput,
      value: {
        type: "string",
        description: "Text, may hold several lines",
        example: "line 1\nline 2"
      },
      maximizable: true,
      copyAs: "text",
      saveAs: "text"
    }),

    Text: new AppletComponent({
      component: TextOutput,
      value: {
        type: "string",
        description: "One line of text",
        example: "42"
      },
      batchComponent: "Code",
      copyAs: "text",
      saveAs: "text"
    }),

    Mermaid: new AppletComponent({
      component: MermaidOutput,
      value: {
        type: "string",
        description: "Mermaid source",
        example: "graph TD; A-->B"
      },
      maximizable: true
    }),

    Pintora: new AppletComponent({
      component: PintoraOutput,
      value: {
        type: "string",
        description: "Pintora source",
        example: "sequenceDiagram\n  A->>B: hello"
      },
      maximizable: true
    }),

    React: new AppletComponent({
      component: ReactOutput,
      value: {
        type: "string",
        description: "JSX source, run as is",
        example: "<h1>Hello</h1>"
      },
      maximizable: true,
      hideInHistory: true
    }),

    DataGrid: new AppletComponent({
      component: DataGridOutput,
      value: {
        type: "json-string",
        description: "Rows as a JSON array, written as text",
        example: "[{\"name\": \"a\", \"size\": 1}, {\"name\": \"b\", \"size\": 2}]"
      },
      maximizable: true,
      hideInHistory: true
    }),

    Color: new AppletComponent({
      component: ColorOutput,
      value: {
        type: "string",
        description: "Any CSS color",
        example: "#ff0000"
      },
      historyComponent: ColorHistory
    }),

    ColorPallete: new AppletComponent({
      component: ColorPalleteOutput,
      props: [
        {
          name: "showInfo",
          type: "boolean",
          default: false,
          description: "Show the hex code on each color"
        },
        {
          name: "singleColor",
          type: "boolean",
          default: false,
          description: "Take one color as a plain string instead of a list"
        }
      ],
      value: {
        type: "array",
        description: "Colors as a list of strings, or that list as JSON text",
        example: [
          "#ef4444",
          "#22c55e",
          "#3b82f6"
        ],
        itemType: "string"
      },
      historyComponent: ColorPalleteHistory
    }),

    KeyValue: new AppletComponent({
      component: KeyValueOutput,
      props: [
        {
          name: "fields",
          type: "object",
          description: "Row order and labels: { key: { label } }, keys left out are hidden",
          example: {
            words: {
              label: "Words"
            },
            lines: {
              label: "Lines"
            }
          }
        },
        {
          name: "label",
          type: "string",
          description: "Title of the card when several KeyValue fields are grouped",
          example: "Stats"
        }
      ],
      value: {
        type: "object",
        description: "One row per key, or that object as JSON text",
        example: {
          words: 12,
          lines: 3
        }
      },
      batchComponent: "Code",
      hideInHistory: true
    })
  }

  /**
   * List of input component keys
   */
  get listOfInputs() {
    return Object.keys(this.inputs)
  }

  /**
   * List of output component keys
   */
  get listOfOutputs() {
    return Object.keys(this.outputs)
  }

  /**
   * Get input component or batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getInputComponent(componentName: keyof typeof this.inputs, isBatchComponent: boolean = false): AppletComponent {
    // Extension components have no batch variant
    if (extensionComponentRegistry.isExtensionComponent(componentName)) {
      return extensionComponentRegistry.getInput(componentName)
    }

    const inputComponent = this.inputs[componentName]
    if (isBatchComponent) {
      const inputComponentBatch = this.inputs[inputComponent.batchComponent as keyof typeof this.inputs]
      if (inputComponentBatch) {
        return inputComponentBatch
      }
      return inputComponent
    }
    return inputComponent
  }

  /**
   * Get output component or batch mode component
   *
   * @param componentName
   * @param isBatchComponent
   * @returns
   */
  getOutputComponent(componentName: keyof typeof this.outputs, isBatchComponent: boolean = false): AppletComponent {
    if (extensionComponentRegistry.isExtensionComponent(componentName)) {
      return extensionComponentRegistry.getOutput(componentName)
    }

    const outputComponent = this.outputs[componentName]
    if (isBatchComponent) {
      const outputComponentBatch = this.outputs[outputComponent.batchComponent as keyof typeof this.outputs]
      if (outputComponentBatch) {
        return outputComponentBatch
      }
      return outputComponent
    }
    return outputComponent
  }

  /**
   * Read file as content based on component type
   *
   * @param component
   * @param filePath
   * @returns
   */
  async readFileFromComponent(component: AppletComponent, filePath: string) {
    const readFileAs = component.readFileAs
    const fileName = getFileNameFromPath(filePath)

    try {
      if (readFileAs === "text") {
        const fileContent = await fileService.readFileAsText(filePath)
        return convertCRLFtoLF(fileContent)
      } else if (readFileAs === "file" || readFileAs === "files") {
        const file = await fileService.readFileAsBinary(filePath)
        return createFileFromUint32Array(file, getFileNameFromPath(filePath))
      }
    } catch (exception) {
      toast.error(`Unable to read ${fileName} as ${readFileAs}`)
    }
  }

  /**
   * Read several files at once. Components reading as "files" get every file
   * as a single File[] value, other components only get the first file.
   *
   * @param component
   * @param filePaths
   * @returns
   */
  async readFilesFromComponent(component: AppletComponent, filePaths: string[]) {
    if (component.readFileAs !== "files") {
      return await this.readFileFromComponent(component, filePaths[0])
    }

    const files = await Promise.all(
      filePaths.map(async(filePath) => await this.readFileFromComponent(component, filePath))
    )
    const readFiles = files.filter((file): file is File => file instanceof File)

    return readFiles.length > 0 ? readFiles : undefined
  }

  /**
   * Open OS file picker / manager to choose file, and open the file as content
   * based on component type
   *
   * @param component
   * @returns
   */
  async openFileAndReadFromComponent(component: AppletComponent) {
    if (component.readFileAs === "files") {
      const selectedFilePaths = await open({ multiple: true })

      if (selectedFilePaths && selectedFilePaths.length > 0) {
        return await this.readFilesFromComponent(component, selectedFilePaths)
      }

      return
    }

    const selectedFilePath = await open()

    // Since plugin-dialog v2 `open()` resolves to the path itself, not a file object
    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await this.readFileFromComponent(component, selectedFilePath)
    }
  }
}

export const appletComponentService = new AppletComponentService()
