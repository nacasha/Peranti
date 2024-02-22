import { useMemo } from "react"
import { getConnectedEdges, Handle, useNodeId, useStore } from "reactflow"

const selector = (s: any) => ({
  nodeInternals: s.nodeInternals,
  edges: s.edges
})

export const CustomHandle = (props: any) => {
  const { nodeInternals, edges } = useStore(selector)
  const nodeId = useNodeId()

  const isHandleConnectable = useMemo(() => {
    if (typeof props.isConnectable === "function") {
      const node = nodeInternals.get(nodeId)
      const connectedEdges = getConnectedEdges([node], edges)

      return props.isConnectable({ node, connectedEdges })
    }

    if (typeof props.isConnectable === "number") {
      const node = nodeInternals.get(nodeId)
      const connectedEdges = getConnectedEdges([node], edges)

      return connectedEdges.length < props.isConnectable
    }

    return props.isConnectable
  }, [nodeInternals, edges, nodeId, props.isConnectable])

  return (
    <Handle {...props} isConnectable={isHandleConnectable}></Handle>
  )
}
