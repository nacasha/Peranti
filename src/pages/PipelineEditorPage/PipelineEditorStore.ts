import { makeAutoObservable } from "mobx"
import { type Edge, type Node, type OnConnect, type OnEdgesChange, type OnNodesChange, addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow"

import { type AppletConstructor } from "src/models/AppletConstructor"
import { generateRandomString, stringEntries } from "src/utils/generate-random-string"

export class PipelineEditorStore {
  initialized: boolean = false

  nodes: Node[] = []

  edges: Edge[] = []

  onValueChange: (value: any) => void = () => {}

  readOnly: boolean = false

  constructor(nodes: Node[] = [], edges: Edge[] = [], onValueChange?: any, readOnly: boolean = false) {
    this.nodes = nodes
    this.edges = edges
    this.onValueChange = onValueChange
    this.readOnly = readOnly
    makeAutoObservable(this)
  }

  onNodesChange: OnNodesChange = (changes) => {
    if (this.readOnly) {
      return
    }

    this.nodes = applyNodeChanges(changes, this.nodes)
  }

  onEdgesChange: OnEdgesChange = (changes) => {
    if (this.readOnly) {
      return
    }

    this.edges = applyEdgeChanges(changes, this.edges)
  }

  onConnect: OnConnect = (connection) => {
    if (this.readOnly) {
      return
    }

    this.edges = addEdge({ ...connection, animated: true }, this.edges)
  }

  setNodes = (nodes: Node[]) => {
    if (this.readOnly) {
      return
    }

    this.nodes = nodes
  }

  setEdges = (edges: Edge[]) => {
    if (this.readOnly) {
      return
    }

    this.edges = edges
  }

  save = () => {
    if (this.readOnly) {
      return
    }

    this.onValueChange({ edges: this.edges, nodes: this.nodes })
  }

  addInputOrOutput = (type: "input" | "output", position: { x: number, y: number }) => {
    const nodeType = type === "input" ? "appletInput" : "appletOutput"
    const label = type === "input" ? "Input" : "Output"
    const inputId = type + "-".concat(generateRandomString(10, stringEntries.smallAz))

    const numberOfNodesCreated = this.nodes.filter((node) => node.type === nodeType).length

    const newNode: Node = {
      id: inputId,
      type: nodeType,
      position,
      data: { component: "Text", key: inputId, label: `${label} ${numberOfNodesCreated + 1}` }
    }

    this.setNodes([...this.nodes, newNode])
  }

  addTool = (tool: AppletConstructor, position: { x: number, y: number }) => {
    const newNode: Node = {
      id: tool.appletId.concat("-" + generateRandomString(10, stringEntries.smallAz)),
      type: "applet",
      position,
      data: { appletId: tool.appletId }
    }

    this.setNodes([...this.nodes, newNode])
  }
}
