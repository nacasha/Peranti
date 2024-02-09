import { Command } from "@tauri-apps/api/shell"
import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, pausePersisting, startPersisting, stopPersisting } from "mobx-persist-store"
import toast from "react-hot-toast"

import { StorageKeys } from "src/constants/storage-keys"
import { AppletType } from "src/enums/applet-type"
import { appletStore } from "src/services/applet-store"
import { componentService } from "src/services/component-manager"
import { sessionStore } from "src/services/session-store"
import { StorageManager } from "src/services/storage-manager"
import { type AppletConstructor } from "src/types/AppletConstructor"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletState } from "src/types/AppletState"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type LayoutSetting } from "src/types/LayoutSetting"
import { type Pipeline } from "src/types/Pipeline"
import { type Session } from "src/types/Session"
import { type SessionHistory } from "src/types/SessionHistory"
import { generateRandomString } from "src/utils/generate-random-string"

export class Applet<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  readonly appletId: string

  readonly type: AppletType

  readonly name: string

  readonly category: string

  readonly sessionId: string

  readonly layoutSetting: LayoutSetting

  readonly autoRun: boolean = false

  isAutoRunAndFirstTime: boolean = false

  readonly pipelines: Pipeline[] = []

  private canRunPipeline = true

  sessionSequenceNumber?: number

  sessionName?: string

  readonly inputFields: Array<AppletInput<IF>> | ((inputValues: any) => Array<AppletInput<IF>>)

  @observable inputFieldsState: any = {}

  @observable inputValues: any = {}

  isInputValuesModified: boolean = false

  readonly outputFields: Array<AppletOutput<OF>> | ((outputValues: any) => Array<AppletOutput<OF>>)

  @observable outputFieldsState: Record<string, any> = {}

  @observable outputValues: any = {}

  isOutputValuesModified: boolean = false

  readonly action: (input: any, activity: any) => any

  @observable actionRunCount: number = 0

  @observable isActionRunning: boolean = false

  @observable batchModeInputKey: string = ""

  @observable batchModeOutputKey: string = ""

  @observable isBatchModeEnabled: boolean = false

  isDeleting: boolean = false

  @observable isDeleted: boolean = false

  @observable renderCounter: number = 0

  readonly state?: AppletState = undefined

  readonly disablePersistence: boolean = false

  readonly disableMultipleSession: boolean = false

  readonly hideOnSidebar: boolean = false

  readonly metadata?: ExtensionMetadata

  readonly samples: Array<Partial<IF> | (() => Partial<IF>)> = []

  /**
   * Indicates that the applet has input values overridden by preset
   */
  readonly hasOverriddenDefaultState: boolean = false

  @observable sampleIndex: number = 0

  static empty() {
    return new Applet({
      name: "",
      appletId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  constructor(
    appletConstructor: AppletConstructor<IF, OF>,
    options: {
      initialState?: Partial<AppletState>
      disablePersistence?: boolean
    } = {}
  ) {
    this.appletId = appletConstructor.appletId
    this.sessionId = appletConstructor.appletId === ""
      ? ""
      : this.appletId.concat(generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"))
    this.name = appletConstructor.name
    this.action = appletConstructor.action ?? (() => ({}))
    this.category = appletConstructor.category
    this.inputFields = appletConstructor.inputFields
    this.outputFields = appletConstructor.outputFields
    this.pipelines = appletConstructor.pipelines ?? []
    this.autoRun = appletConstructor.autoRun ?? true
    this.type = appletConstructor.type ?? AppletType.Tool
    this.metadata = appletConstructor.metadata
    this.samples = appletConstructor.samples ?? []
    this.disableMultipleSession = appletConstructor.disableMultipleSession ?? false
    this.hideOnSidebar = appletConstructor.hideOnSidebar ?? false
    this.hasOverriddenDefaultState = appletConstructor.hasOverriddenDefaultState ?? false
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
      ...appletConstructor.layoutSetting
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
      this.sessionName = appletStore.mapOfLoadedApplets[this.appletId].name
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

    if (!this.appletId || this.disablePersistence) {
      return
    }

    void makePersistable(
      this,
      {
        name: StorageKeys.AppletState.concat(this.sessionId),
        properties: [
          {
            key: "state",
            serialize: () => {
              return this.toState()
            },
            deserialize: () => {
              return this.state
            }
          }
        ]
      },
      {
        delay: 100
      }
    )
  }

  toState(): AppletState {
    const {
      batchModeInputKey,
      batchModeOutputKey,
      inputFieldsState,
      inputValues,
      isBatchModeEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState,
      outputValues,
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      appletId,
      isAutoRunAndFirstTime
    } = this

    const createdAt = new Date().getTime()

    return {
      batchModeInputKey,
      batchModeOutputKey,
      createdAt,
      inputFieldsState: toJS(inputFieldsState),
      inputValues: toJS(inputValues),
      isBatchModeEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState: toJS(outputFieldsState),
      outputValues: toJS(outputValues),
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      appletId,
      isAutoRunAndFirstTime
    }
  }

  toSession(): Session {
    const { sessionId, sessionName, sessionSequenceNumber, appletId } = this

    return { sessionId, sessionName, sessionSequenceNumber, appletId }
  }

  toHistory(): SessionHistory {
    const { sessionId, sessionName, appletId } = this
    const deletedAt = new Date().getTime()

    return { deletedAt, sessionId, sessionName, appletId }
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

  getInputFieldsWithReadableFile(): [Array<AppletInput<IF>>, boolean] {
    const inputFields = this.getInputFields()

    let hasAllowBatch = false
    const filteredInputFields = inputFields.filter((inputField) => {
      if (inputField.allowBatch) {
        hasAllowBatch = true
      }

      const inputToCompare = componentService.getInputComponent(inputField.component)
      return !!inputToCompare.readFileAs
    })

    if (filteredInputFields.length > 0) {
      return [filteredInputFields, false]
    }

    if (!hasAllowBatch) {
      return [[], hasAllowBatch]
    }

    const filteredBatchInputFields = inputFields.filter((inputField) => {
      const inputToCompare = componentService.getInputComponent(inputField.component, true)

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

    if (this.type === AppletType.Extension) {
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
      const result = this.action(actionInput, { toast })

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
        console.log("Failed to run applet")
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
    const mergedPipelines = [this, ...pipelines, this]

    for (let index = 0; index < mergedPipelines.length; index++) {
      const pipeline = mergedPipelines[index]

      if (index === 0) {
        pipelineResults.push((pipeline as this).inputValues)
      } else if (index === mergedPipelines.length - 1) {
        this.setOutputValues(pipelineResults[index - 1])
      } else {
        const appletConstructor = appletStore.mapOfLoadedApplets[pipeline.appletId]
        const applet = new Applet(appletConstructor)
        applet.canRunPipeline = false

        const previousResult = pipelineResults[index - 1];
        (pipeline as Pipeline).fields.forEach((field: any) => {
          if (field.previousOutputKey) {
            applet.setInputValue(field.inputKey, previousResult[field.previousOutputKey])
          } else if (field.value) {
            applet.setInputValue(field.inputKey, field.value)
          }
        })

        await applet.run()
        pipelineResults.push(applet.outputValues)
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

  getHasIframe() {
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
      await StorageManager.updateAppletStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true
      })
    }
  }

  @action
  setSampleIndex(index: number) {
    this.sampleIndex = index
  }

  getHasSamples() {
    return this.samples.length > 0
  }
}
