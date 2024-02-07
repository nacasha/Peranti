import { Command } from "@tauri-apps/api/shell"
import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, pausePersisting, startPersisting, stopPersisting } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { ToolType } from "src/enums/ToolType"
import { toolComponentService } from "src/services/toolComponentService"
import { ToolStorageManager } from "src/services/toolStorageManager"
import { sessionStore } from "src/stores/sessionStore"
import { toolStore } from "src/stores/toolStore"
import { type LayoutSetting } from "src/types/LayoutSetting"
import { type Session } from "src/types/Session"
import { type SessionHistory } from "src/types/SessionHistory"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolExtensionMetadata } from "src/types/ToolExtensionMetadata"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"
import { type ToolState } from "src/types/ToolState"
import { generateRandomString } from "src/utils/generateRandomString"

export class Tool<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  readonly toolId: string

  readonly type: ToolType

  readonly name: string

  readonly category: string

  readonly sessionId: string

  readonly layoutSetting: LayoutSetting

  readonly autoRun: boolean = false

  isAutoRunAndFirstTime: boolean = false

  readonly pipelines: any[] = []

  private canRunPipeline = true

  sessionSequenceNumber?: number

  sessionName?: string

  readonly inputFields: Array<ToolInput<IF>> | ((inputValues: any) => Array<ToolInput<IF>>)

  @observable inputFieldsState: any = {}

  @observable inputValues: any = {}

  isInputValuesModified: boolean = false

  readonly outputFields: Array<ToolOutput<OF>> | ((outputValues: any) => Array<ToolOutput<OF>>)

  @observable outputFieldsState: Record<string, any> = {}

  @observable outputValues: any = {}

  isOutputValuesModified: boolean = false

  readonly action: (input: any) => any

  @observable actionRunCount: number = 0

  @observable isActionRunning: boolean = false

  @observable batchModeInputKey: string = ""

  @observable batchModeOutputKey: string = ""

  @observable isBatchModeEnabled: boolean = false

  isDeleting: boolean = false

  @observable isDeleted: boolean = false

  @observable renderCounter: number = 0

  readonly toolState?: ToolState = undefined

  readonly disablePersistence: boolean = false

  readonly disableMultipleSession: boolean = false

  readonly hideOnSidebar: boolean = false

  readonly metadata?: ToolExtensionMetadata

  readonly samples: Array<IF | (() => IF)> = []

  @observable sampleIndex: number = 0

  @action
  setSampleIndex(index: number) {
    this.sampleIndex = index
  }

  getHasSamples() {
    return this.samples.length > 0
  }

  static generateSessionId(toolId: string) {
    return toolId.concat(generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"))
  }

  static getToolIdFromSessionId(sessionId: string) {
    return sessionId.split("|")[0]
  }

  static empty() {
    return new Tool({
      name: "",
      toolId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  constructor(
    toolConstructor: ToolConstructor<IF, OF>,
    options: {
      initialState?: Partial<ToolState>
      disablePersistence?: boolean
    } = {}
  ) {
    this.toolId = toolConstructor.toolId
    this.sessionId = toolConstructor.toolId === "" ? "" : Tool.generateSessionId(toolConstructor.toolId)
    this.name = toolConstructor.name
    this.action = toolConstructor.action ?? (() => ({}))
    this.category = toolConstructor.category
    this.inputFields = toolConstructor.inputFields
    this.outputFields = toolConstructor.outputFields
    this.pipelines = toolConstructor.pipelines ?? []
    this.autoRun = toolConstructor.autoRun ?? true
    this.type = toolConstructor.type ?? ToolType.Tool
    this.metadata = toolConstructor.metadata
    this.samples = toolConstructor.samples ?? []
    this.disableMultipleSession = toolConstructor.disableMultipleSession ?? false
    this.hideOnSidebar = toolConstructor.hideOnSidebar ?? false
    this.inputValues = this.getInputValuesWithDefault()

    if (this.autoRun) {
      this.isAutoRunAndFirstTime = true
    }

    this.layoutSetting = {
      direction: "horizontal",
      reversed: false,
      gridTemplate: "1fr 1fr",
      inputAreaDirection: "vertical",
      outputAreaDirection: "vertical",
      ...toolConstructor.layoutSetting
    }

    const { initialState, disablePersistence = false } = options
    if (initialState) {
      this.sessionId = initialState.sessionId ?? this.sessionId
      this.sessionName = initialState.sessionName ?? this.sessionName
      this.sessionSequenceNumber = initialState.sessionSequenceNumber ?? this.sessionSequenceNumber
      this.inputValues = Object.assign(this.inputValues, initialState.inputValues)
      this.outputValues = Object.assign(this.outputValues, initialState.outputValues)
      this.isBatchModeEnabled = initialState.isBatchModeEnabled ?? this.isBatchModeEnabled
      this.batchModeInputKey = initialState.batchModeInputKey ?? this.batchModeInputKey
      this.batchModeOutputKey = initialState.batchModeOutputKey ?? this.batchModeOutputKey
      this.actionRunCount = initialState.actionRunCount ?? this.actionRunCount
      this.isOutputValuesModified = initialState.isOutputValuesModified ?? this.isOutputValuesModified
      this.isInputValuesModified = initialState.isInputValuesModified ?? this.isInputValuesModified
      this.isDeleted = initialState.isDeleted ?? this.isDeleted
      this.inputFieldsState = initialState.inputFieldsState ?? this.inputFieldsState
      this.outputFieldsState = initialState.outputFieldsState ?? this.outputFieldsState
      this.isAutoRunAndFirstTime = initialState.isAutoRunAndFirstTime ?? this.isAutoRunAndFirstTime
    }

    if (this.disableMultipleSession) {
      this.sessionName = toolStore.mapOfLoadedTools[this.toolId].name
    }

    this.disablePersistence = disablePersistence

    makeObservable(this)
    this.setupPersistence()
  }

  private setupPersistence() {
    Array.from(PersistStoreMap.keys()).forEach((sessionKey) => {
      if (sessionKey?.sessionId === this.sessionId) {
        PersistStoreMap.delete(sessionKey)
      }
    })

    if (!this.toolId || this.disablePersistence) {
      return
    }

    void makePersistable(
      this,
      {
        name: StorageKeys.ToolState.concat(this.sessionId),
        properties: [
          {
            key: "toolState",
            serialize: () => {
              return this.toState()
            },
            deserialize: () => {
              return this.toolState
            }
          }
        ]
      },
      {
        delay: 100
      }
    )
  }

  toState(): ToolState {
    const {
      batchModeInputKey: batchInputKey,
      batchModeOutputKey: batchOutputKey,
      inputFieldsState,
      inputValues,
      isBatchModeEnabled: isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState,
      outputValues,
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      isAutoRunAndFirstTime
    } = this

    const createdAt = new Date().getTime()

    return {
      batchModeInputKey: batchInputKey,
      batchModeOutputKey: batchOutputKey,
      createdAt,
      inputFieldsState: toJS(inputFieldsState),
      inputValues: toJS(inputValues),
      isBatchModeEnabled: isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState: toJS(outputFieldsState),
      outputValues: toJS(outputValues),
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      isAutoRunAndFirstTime
    }
  }

  toSession(): Session {
    const { sessionId, sessionName, sessionSequenceNumber, toolId } = this

    return { sessionId, sessionName, sessionSequenceNumber, toolId }
  }

  toHistory(): SessionHistory {
    const { sessionId, sessionName, toolId } = this
    const deletedAt = new Date().getTime()

    return { deletedAt, sessionId, sessionName, toolId }
  }

  @action
  setSessionName(value: string) {
    this.sessionName = value
  }

  @action
  setSessionSequenceNumber(value?: number) {
    this.sessionSequenceNumber = value
  }

  @action
  setIsDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchModeEnabled = isEnabled

    if (this.batchModeInputKey === "") {
      this.batchModeInputKey = this.getInputFields().filter((input) => input.allowBatch)[0].key
    }

    if (this.batchModeOutputKey === "") {
      this.batchModeOutputKey = this.getOutputFields().filter((output) => output.allowBatch)[0].key
    }
  }

  @action
  setBatchModeOutputKey(batchOutputKey: string) {
    this.batchModeOutputKey = batchOutputKey
  }

  @action
  setBatchModeInputKey(batchInputKey: string) {
    this.batchModeInputKey = batchInputKey
  }

  getInputFields() {
    if (typeof this.inputFields === "function") {
      return this.inputFields(this.inputValues)
    }
    return this.inputFields
  }

  getInputFieldsWithReadableFile(): [Array<ToolInput<IF>>, boolean] {
    const inputFields = this.getInputFields()

    let hasAllowBatch = false
    const filteredInputFields = inputFields.filter((inputField) => {
      if (inputField.allowBatch) {
        hasAllowBatch = true
      }

      const inputToCompare = toolComponentService.getInputComponent(inputField.component)
      return !!inputToCompare.readFileAs
    })

    if (filteredInputFields.length > 0) {
      return [filteredInputFields, false]
    }

    if (!hasAllowBatch) {
      return [[], hasAllowBatch]
    }

    const filteredBatchInputFields = inputFields.filter((inputField) => {
      const inputToCompare = toolComponentService.getInputComponent(inputField.component, true)

      return !!inputToCompare.readFileAs
    })

    return [filteredBatchInputFields, true]
  }

  getOutputFields() {
    if (typeof this.outputFields === "function") {
      return this.outputFields(this.inputValues)
    }
    return this.outputFields
  }

  @action
  setInputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    const newInputValues = { ...this.inputValues, [key]: value }

    const inputValuesHasChanged = value instanceof File
      ? true
      : !fastDeepEqual(this.inputValues, newInputValues)

    if (inputValuesHasChanged) {
      this.inputValues = { ...this.inputValues, [key]: value }
    }

    if (!this.isAutoRunAndFirstTime) {
      this.isInputValuesModified = options.markAsModified
    }
  }

  @action
  setInputValues(inputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.inputValues = inputValues

    if (!this.isAutoRunAndFirstTime) {
      this.isInputValuesModified = options.markAsModified
    }
  }

  getInputValue(key: string) {
    return this.inputValues[key]
  }

  @action
  setOutputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = { ...this.outputValues, [key]: value }

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  @action
  setOutputValues(outputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = outputValues

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  getOutputValue(key: string) {
    return this.outputValues[key]
  }

  @action
  resetInputAndOutputValues() {
    this.inputValues = this.getInputValuesWithDefault()
    this.outputValues = {}
  }

  getInputValuesWithDefault() {
    return Object.fromEntries(this.getInputFields().map((i) => [i.key, i.defaultValue]))
  }

  getIsInputOrOutputHasValues(): boolean {
    const inputFields = this.getInputFields()
    const hasInputValues = Object.entries(this.inputValues).filter(
      ([key, value]) => Boolean(value) && !inputFields.find((field) => field.key === key)?.skipValidateHasValue
    ).length > 0

    const hasOutputValues = Object.values(this.outputValues).filter(
      (value) => Boolean(value)
    ).length > 0

    return hasInputValues || hasOutputValues
  }

  @action
  setInputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.inputFieldsState = { ...this.inputFieldsState, [key]: state }
  }

  @action
  setOutputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.outputFieldsState = { ...this.outputFieldsState, [key]: state }
  }

  @action
  resetInputAndOutputFieldsState() {
    this.inputFieldsState = {}
    this.outputFieldsState = {}
  }

  @action
  private setIsActionRunning(value: boolean) {
    this.isActionRunning = value
    sessionStore.keepAliveSession(this.sessionId, value)
  }

  @action
  private incrementActionRunCount() {
    this.actionRunCount = this.actionRunCount + 1
  }

  async run() {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === ToolType.Extension) {
      void this.runExtension()
      return
    }

    if (this.canRunPipeline && this.pipelines.length > 0) {
      await this.runPipeline()
    } else if (this.isBatchModeEnabled) {
      await this.runBatch()
    } else {
      await this.runNormal()
    }

    if (this.isAutoRunAndFirstTime) {
      this.isAutoRunAndFirstTime = false
    } else {
      this.incrementActionRunCount()
    }
  }

  private async runAction(actionInput: any) {
    const runResult = await new Promise<any>((resolve) => {
      const result = this.action(actionInput)

      if ("then" in result) {
        this.setIsActionRunning(true)
        result
          .then((data: any) => {
            this.setIsActionRunning(false)
            resolve(data)
          })
          .catch(() => {
            this.setIsActionRunning(false)
            resolve(undefined)
          })
      }

      resolve(result)
    })

    return runResult
  }

  private async runExtension() {
    if (this.metadata) {
      this.setIsActionRunning(true)

      const { actionFile } = this.metadata

      try {
        const inputParams = JSON.stringify({ ...this.inputValues })
        const command = Command.sidecar("binaries/node", [actionFile, inputParams])

        const result = await command.execute()
        this.setOutputValues(JSON.parse(result.stdout))
      } catch (exception) {
        console.log("Tool failed to run")
      }

      this.setIsActionRunning(false)
    }
  }

  private async runNormal() {
    const runResult = await this.runAction({ ...this.inputValues })
    this.setOutputValues(runResult)
  }

  private async runPipeline() {
    const { pipelines = [] } = this
    const pipelineResults = []
    const pipelineTools = [this, ...pipelines, this]

    for (let i = 0; i < pipelineTools.length; i++) {
      const pipeline = pipelineTools[i]

      if (i === 0) {
        pipelineResults.push(pipeline.inputValues)
      } else if (i === pipelineTools.length - 1) {
        this.setOutputValues(pipelineResults[i - 1])
      } else {
        const toolConstructor = toolStore.mapOfLoadedTools[pipeline.toolId]
        const tool = new Tool(toolConstructor)
        tool.canRunPipeline = false

        const previousResult = pipelineResults[i - 1]
        pipeline.fields.forEach((field: any) => {
          if (field.previousOutputKey) {
            tool.setInputValue(field.inputKey, previousResult[field.previousOutputKey])
          } else if (field.value) {
            tool.setInputValue(field.inputKey, field.value)
          }
        })

        await tool.run()
        pipelineResults.push(tool.outputValues)
      }
    }
  }

  private async runBatch() {
    const { inputValues, batchModeInputKey: batchInputKey } = this
    const batchInputValues = inputValues[batchInputKey]
    const inputLines = batchInputValues.split("\n")

    const outputs = []
    for (const inputLine of inputLines) {
      const runResult = await this.runAction({ ...inputValues, [batchInputKey]: inputLine })
      outputs.push(runResult)
    }

    const listOfOutputParams: Record<string, string[]> = outputs.reduce((sum, a) => {
      Object.entries(a).forEach(([key, value]) => {
        if (!sum[key]) sum[key] = []
        sum[key].push(value)
      })

      return sum
    }, {})

    this.setOutputValues(
      Object.fromEntries(
        Object.entries(listOfOutputParams).map(([key, value]) => [key, value.join("\n")])
      )
    )
  }

  @action
  forceRerender() {
    this.renderCounter += 1
  }

  getToolHasIframe() {
    return this.getOutputFields().some((field) => field.component === "IFrame")
  }

  async hydrateStore() {
    await hydrateStore(this)
  }

  pauseStore() {
    pausePersisting(this)
  }

  startStore() {
    startPersisting(this)
  }

  stopStore() {
    stopPersisting(this)
  }

  @action
  setDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  @action
  async markAsDeleted() {
    this.resetInputAndOutputFieldsState()
    this.setDeleted(true)

    if (!isPersisting(this)) {
      await ToolStorageManager.updateToolStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true
      })
    }
  }
}
