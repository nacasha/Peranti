import { type Edge, type Node } from "reactflow"
import { merge } from "ts-deepmerge"

type Values = Record<string, any>

interface NodeValues {
  inputValues: Values
  outputValues: Values
}

interface RunPipelineParams {
  nodes: Node[]
  edges: Edge[]

  /**
   * Values of the pipeline's own inputs, read by its "appletInput" nodes
   */
  pipelineInputValues: Values

  /**
   * Runs the tool of an "applet" node and returns its output values
   */
  runApplet: (appletId: string, inputValues: Values) => Promise<Values>
}

/**
 * Runs every node of a pipeline in dependency order and returns the values
 * that reach its "appletOutput" nodes, keyed by output key.
 *
 * Runs in two phases:
 * 1. Nodes with no incoming edges (pipeline inputs, tools without inputs).
 * 2. Nodes whose incoming edges have all delivered a value.
 *
 * An edge that comes up a second time means the graph is stuck (a cycle, or
 * a tool that returned nothing), so the run stops there.
 */
export async function runPipeline({ nodes, edges, pipelineInputValues, runApplet }: RunPipelineParams) {
  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]))

  const incomingEdgeCount: Record<string, number> = {}
  edges.forEach((edge) => {
    incomingEdgeCount[edge.target] = (incomingEdgeCount[edge.target] ?? 0) + 1
  })

  const valuesByNode: Record<string, NodeValues> = {}
  const getNodeValues = (nodeId: string) => {
    valuesByNode[nodeId] ??= { inputValues: {}, outputValues: {} }
    return valuesByNode[nodeId]
  }

  const findReadySources = () => edges.filter((edge) => (
    !incomingEdgeCount[edge.source] && !valuesByNode[edge.source]
  ))

  const findReadyDependents = () => edges.filter((edge) => {
    const { inputValues = {}, outputValues = {} } = valuesByNode[edge.source] ?? {}
    const hasAllInputs = incomingEdgeCount[edge.source] === Object.values(inputValues).length
    const hasNotRun = Object.values(outputValues).length === 0

    return hasAllInputs && hasNotRun
  })

  const runCountByEdge: Record<string, number> = {}
  let phase: "sources" | "dependents" = "sources"
  let isStuck = false
  let pending = findReadySources()

  while (pending.length > 0 && !isStuck) {
    const edge = pending[0]
    const node = nodesById[edge.source]

    runCountByEdge[edge.id] = (runCountByEdge[edge.id] ?? 0) + 1
    isStuck = runCountByEdge[edge.id] > 1

    const sourceValues = getNodeValues(edge.source)
    getNodeValues(edge.target)

    // Produce the source node's output values
    if (node.type === "applet") {
      const appletOutputValues = await runApplet(node.data.appletId, sourceValues.inputValues)
      sourceValues.outputValues = merge(sourceValues.outputValues, appletOutputValues)
    } else if (node.type === "appletInput" && edge.sourceHandle && edge.targetHandle) {
      sourceValues.outputValues[edge.sourceHandle] = pipelineInputValues[node.data.key]
    }

    // Pass them along every edge leaving the source node
    edges
      .filter((outgoing) => outgoing.source === edge.source)
      .forEach((outgoing) => {
        if (!outgoing.sourceHandle || !outgoing.targetHandle) {
          return
        }

        const targetValues = getNodeValues(outgoing.target)
        targetValues.inputValues = merge(targetValues.inputValues, {
          [outgoing.targetHandle]: sourceValues.outputValues[outgoing.sourceHandle]
        })
      })

    if (phase === "sources") {
      pending = findReadySources()
      if (pending.length === 0) {
        phase = "dependents"
      }
    }

    if (phase === "dependents") {
      pending = findReadyDependents()
    }
  }

  const outputValues: Values = {}
  nodes
    .filter((node) => node.type === "appletOutput" && valuesByNode[node.id]?.inputValues)
    .forEach((node) => {
      outputValues[node.data.key] = valuesByNode[node.id].inputValues[node.data.key]
    })

  return outputValues
}
