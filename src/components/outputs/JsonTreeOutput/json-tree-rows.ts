export type JsonTreeKind = "object" | "array" | "string" | "number" | "boolean" | "null"

export interface JsonTreeRow {
  path: string
  depth: number

  /**
   * Object key or array index, `undefined` for the root
   */
  name?: string | number
  kind: JsonTreeKind
  value: unknown

  /**
   * Number of keys or items, only for objects and arrays
   */
  size?: number
  isExpanded?: boolean

  /**
   * While filtering: the node itself matches the query
   */
  isMatch?: boolean

  /**
   * While filtering: all children are shown, not only those leading to matches
   */
  isRevealed?: boolean

  /**
   * While filtering: children hidden because they lead to no match, a branch
   * with all its children hidden has nothing to open until it is revealed
   */
  hiddenCount?: number
}

export interface JsonTreeFilter {
  /**
   * Nodes matching the query
   */
  matched: Set<string>

  /**
   * Matches and their ancestors
   */
  visible: Set<string>

  /**
   * Branches showing all their children
   */
  revealed: Set<string>

  /**
   * Branches closed by hand, which would otherwise show their children
   */
  collapsed: Set<string>
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

export function getJsonTreeKind(value: unknown): JsonTreeKind {
  if (Array.isArray(value)) {
    return "array"
  }
  const type = typeof value
  switch (type) {
  case "string":
  case "number":
  case "boolean":
    return type
  case "bigint":
    return "number"
  case "object":
    return value === null ? "null" : "object"
  default:
    // undefined, functions and symbols, which JSON has no form for
    return "null"
  }
}

/**
 * JSONPath of a child, e.g. `$.users[0]["first name"]`
 */
export function getJsonChildPath(parentPath: string, name: string | number) {
  if (typeof name === "number") {
    return `${parentPath}[${name}]`
  }
  return IDENTIFIER.test(name) ? `${parentPath}.${name}` : `${parentPath}[${JSON.stringify(name)}]`
}

function getEntries(value: unknown): Array<[string | number, unknown]> {
  if (Array.isArray(value)) {
    return value.map((item, index) => [index, item])
  }
  return Object.entries(value as Record<string, unknown>)
}

/**
 * Paths of every object and array, for "expand all"
 */
export function collectJsonBranchPaths(value: unknown, path = "$", paths: string[] = []) {
  const kind = getJsonTreeKind(value)
  if (kind === "object" || kind === "array") {
    paths.push(path)
    for (const [name, child] of getEntries(value)) {
      collectJsonBranchPaths(child, getJsonChildPath(path, name), paths)
    }
  }
  return paths
}

/**
 * Paths of branches down to `depth` levels, for the initial expansion
 */
export function collectJsonPathsToDepth(value: unknown, depth: number, path = "$", paths: string[] = []) {
  const kind = getJsonTreeKind(value)
  if (depth > 0 && (kind === "object" || kind === "array")) {
    paths.push(path)
    for (const [name, child] of getEntries(value)) {
      collectJsonPathsToDepth(child, depth - 1, getJsonChildPath(path, name), paths)
    }
  }
  return paths
}

function matchesQuery(name: string | number | undefined, value: unknown, query: string) {
  if (name !== undefined && `${name}`.toLowerCase().includes(query)) {
    return true
  }
  const kind = getJsonTreeKind(value)
  return kind !== "object" && kind !== "array" && String(value).toLowerCase().includes(query)
}

/**
 * Paths of every node matching the search query (`matched`), and of those
 * plus their ancestors so the matches stay reachable (`visible`)
 */
export function collectJsonMatchPaths(value: unknown, query: string) {
  const matched = new Set<string>()
  const visible = new Set<string>()
  const lowerQuery = query.toLowerCase()

  const ancestors: string[] = []

  const visit = (node: unknown, path: string, name: string | number | undefined) => {
    if (matchesQuery(name, node, lowerQuery)) {
      matched.add(path)
      visible.add(path)
      // Walk up only until an ancestor already added, everything above it is too
      for (let index = ancestors.length - 1; index >= 0 && !visible.has(ancestors[index]); index--) {
        visible.add(ancestors[index])
      }
    }

    const kind = getJsonTreeKind(node)
    if (kind === "object" || kind === "array") {
      ancestors.push(path)
      for (const [childName, child] of getEntries(node)) {
        visit(child, getJsonChildPath(path, childName), childName)
      }
      ancestors.pop()
    }
  }

  visit(value, "$", undefined)
  return { matched, visible }
}

/**
 * Visible rows of the tree, in display order
 *
 * @param expanded Paths of expanded objects and arrays
 * @param filter When set (searching), a branch shows only the children leading
 * to matches, or all of them once revealed, and `expanded` is not used
 */
export function flattenJsonTree(
  value: unknown,
  expanded: Set<string>,
  filter?: JsonTreeFilter
): JsonTreeRow[] {
  const rows: JsonTreeRow[] = []

  const visitFiltered = (node: unknown, path: string, depth: number, name?: string | number) => {
    const { matched, visible, revealed, collapsed } = filter!
    const kind = getJsonTreeKind(node)
    const isMatch = matched.has(path)

    if (kind !== "object" && kind !== "array") {
      rows.push({ path, depth, name, kind, value: node, isMatch })
      return
    }

    const isRevealed = revealed.has(path)
    const children = getEntries(node)
      .map(([childName, child]) => ({ childName, child, childPath: getJsonChildPath(path, childName) }))
    const shown = isRevealed ? children : children.filter(({ childPath }) => visible.has(childPath))

    rows.push({
      path,
      depth,
      name,
      kind,
      value: node,
      size: children.length,
      isExpanded: shown.length > 0 && !collapsed.has(path),
      isMatch,
      isRevealed,
      hiddenCount: children.length - shown.length
    })

    if (collapsed.has(path)) {
      return
    }

    for (const { childName, child, childPath } of shown) {
      visitFiltered(child, childPath, depth + 1, childName)
    }
  }

  const visit = (node: unknown, path: string, depth: number, name?: string | number) => {
    const kind = getJsonTreeKind(node)
    if (kind !== "object" && kind !== "array") {
      rows.push({ path, depth, name, kind, value: node })
      return
    }

    const entries = getEntries(node)
    const isExpanded = expanded.has(path)
    rows.push({ path, depth, name, kind, value: node, size: entries.length, isExpanded })

    if (!isExpanded) {
      return
    }

    for (const [childName, child] of entries) {
      visit(child, getJsonChildPath(path, childName), depth + 1, childName)
    }
  }

  if (!filter) {
    visit(value, "$", 0)
  } else if (filter.visible.has("$") || filter.revealed.has("$")) {
    visitFiltered(value, "$", 0)
  }
  return rows
}

/**
 * Parse the value of a JsonTree output, returns `undefined` when it is text
 * that is not (yet) valid JSON. `data` is `undefined` when there is no value.
 */
export function parseJsonTreeValue(value: unknown): { data: unknown } | undefined {
  if (typeof value !== "string") {
    return { data: value }
  }
  if (value.trim().length === 0) {
    return { data: undefined }
  }
  try {
    return { data: JSON.parse(value) }
  } catch {
    return undefined
  }
}
