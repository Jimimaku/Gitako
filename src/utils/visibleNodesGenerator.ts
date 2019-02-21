/**
 * This is the stack for generating an array of nodes for rendering
 *
 * when lower layer changes, higher layers would reset
 * when higher layer changes, lower layers would not notice
 *
 *  render stack                 | when will change         | on change callback
 *
 *  ^  changes frequently
 *  |
 *  |4 focus                     | when hover/focus move    | onFocusChange
 *  |                            |                          |   expandedNodes + focusNode -> visibleNodes
 *  |3 expansion                 | when fold/unfold         | onExpansionChange
 *  |                            |                          |   searchedNodes + toggleNode -> expandedNodes
 *  |2 search key                | when search              | onSearch
 *  |                            |                          |   treeNodes + searchKey -> searchedNodes
 *  |1 tree: { root <-> nodes }  | when tree init           | treeHelper.parse
 *  |                                                       |   tree data from api -> { root, nodes }
 *  v  stable
 */

export type TreeNode = {
  name: string
  contents?: TreeNode[]
  path: string
  url?: string
  virtual?: boolean
  type: 'tree' | 'blob' | 'commit' | 'virtual'
}

const SEARCH_DELAY = 250

function getFilterFunc(keyRegex: RegExp) {
  return function filterFunc({ name }: TreeNode) {
    return keyRegex.test(name)
  }
}

function filterDuplications<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

function search(treeNodes: TreeNode[], searchKey: string): TreeNode[] {
  if (!searchKey) return treeNodes
  /**
   * if searchKey is 'abcd'
   * then keyRegex will be /abcd/i and /a.*?b.*?c.*?d/i
   */
  const keyRegexes = [
    new RegExp(searchKey, 'i'),
    new RegExp(
      searchKey
        .replace(/\//, '')
        .split('')
        .join('.*?'),
      'i',
    ),
  ]
  const searchResults = ([] as TreeNode[]).concat(
    ...keyRegexes.map(keyRegex => treeNodes.filter(getFilterFunc(keyRegex))),
  )
  return filterDuplications(searchResults)
}

function debounce<T, Args extends any[]>(
  func: (...args: Args) => T,
  delay: number,
): (...args: Args) => Promise<T> {
  let timer: number
  return (...args) =>
    new Promise(resolve => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => resolve(func(...args)), delay)
    })
}

export const debouncedSearch = debounce(search, SEARCH_DELAY)

function getNodes(root: TreeNode, nodes: TreeNode[] = []) {
  if (root.contents) {
    root.contents.forEach(node => {
      nodes.push(node)
      getNodes(node, nodes)
    })
  }
  return nodes
}

function compressTree(root: TreeNode, prefix: string[] = []): TreeNode {
  if (root.contents) {
    if (root.contents.length === 1) {
      const singleton = root.contents[0]
      if (singleton.type === 'tree') {
        return compressTree(singleton, [...prefix, root.name])
      }
    }
  }
  return {
    ...root,
    name: [...prefix, root.name].join('/'),
    contents: root.contents ? root.contents.map(node => compressTree(node)) : undefined,
  }
}

class L1 {
  root: TreeNode
  nodes: TreeNode[]
  compressedRoot: TreeNode

  constructor(root: TreeNode) {
    this.root = root
    this.nodes = getNodes(root)
    this.compressedRoot = compressTree(root)
  }
}

class L2 {
  l1: L1
  couldCompress: boolean
  compressed: boolean
  searchedNodes: TreeNode[] | null

  constructor(l1: L1, options: Options) {
    this.l1 = l1
    this.couldCompress = Boolean(options.compress)
    this.compressed = false
    this.searchedNodes = null
  }

  search = async (searchKey: string) => {
    this.compressed = !searchKey
    this.searchedNodes = searchKey
      ? await debouncedSearch(this.l1.nodes, searchKey)
      : this.getRoot().contents || []
  }

  getRoot = () => {
    return this.couldCompress && this.compressed ? this.l1.compressedRoot : this.l1.root
  }
}

class L3 {
  l1: L1
  l2: L2

  nodes: TreeNode[]
  expandedNodes: Set<TreeNode>
  depths: Map<TreeNode, number>

  constructor(l1: L1, l2: L2) {
    this.l1 = l1
    this.l2 = l2
    this.expandedNodes = new Set<TreeNode>()
    this.depths = new Map()
    this.nodes = []
  }

  toggleExpand = (node: TreeNode) => {
    this.setExpand(node, !this.expandedNodes.has(node))
  }

  setExpand = (node: TreeNode, expand: boolean) => {
    if (expand && node.contents) {
      // only node with contents is expandable
      this.expandedNodes.add(node)
    } else {
      this.expandedNodes.delete(node)
    }
    this.generateVisibleNodes()
  }

  expandTo = (path: string) => {
    let root = this.l2.getRoot()
    const findNode: (root: TreeNode) => TreeNode | undefined = root => {
      if (path.indexOf(root.path) === 0) {
        if (root.path === path) return root
        this.setExpand(root, true)
        if (root.contents) {
          for (const content of root.contents) {
            const node = findNode(content)
            if (node) return node
          }
        }
      }
    }
    const node = findNode(root)
    if (node) {
      this.setExpand(node, true)
    }
    return node
  }

  generateVisibleNodes = () => {
    if (this.l2.searchedNodes === null) return
    this.depths.clear()
    const nodesSet = new Set() // prevent duplication
    const nodes = [],
      stack: (TreeNode | null)[] = this.l2.searchedNodes.slice().reverse()
    let current: TreeNode | null,
      depth = 0
    while (stack.length) {
      current = stack.pop()!
      if (current === null) {
        depth -= 1
        continue
      }
      if (nodesSet.has(current)) continue
      nodes.push(current)
      nodesSet.add(current)
      this.depths.set(current, depth)
      if (current && this.expandedNodes.has(current)) {
        stack.push(null) // use null as pop depth flag
        if (current.contents) stack.push(...current.contents.slice().reverse())
        depth += 1
      }
    }
    this.nodes = nodes
  }
}

export type VisibleNodes = {
  nodes: L1['nodes']
  depths: L3['depths']
  expandedNodes: L3['expandedNodes']
  focusedNode: L4['focusedNode']
}

class L4 {
  l1: L1
  l2: L2
  l3: L3

  focusedNode: TreeNode | null

  constructor(l1: L1, l2: L2, l3: L3) {
    this.l1 = l1
    this.l2 = l2
    this.l3 = l3
    this.focusedNode = null
    this.l3.generateVisibleNodes()
  }

  focusNode = (node: TreeNode | null) => {
    this.focusedNode = node
  }
}

type Options = {
  compress?: boolean
}

export default class VisibleNodesGenerator {
  l1: L1
  l2: L2
  l3: L3
  l4: L4

  search: L2['search']
  setExpand: L3['setExpand']
  toggleExpand: L3['toggleExpand']
  expandTo: L3['expandTo']
  focusNode: L4['focusNode']

  constructor(root: TreeNode, options: Options) {
    this.l1 = new L1(root)
    this.l2 = new L2(this.l1, options)
    this.l3 = new L3(this.l1, this.l2)
    this.l4 = new L4(this.l1, this.l2, this.l3)

    this.search = async (...args) => {
      const r = await this.l2.search(...args)
      this.l3.generateVisibleNodes()
      this.l4 = new L4(this.l1, this.l2, this.l3)
      return r
    }
    this.setExpand = (...args) => this.l3.setExpand(...args)
    this.toggleExpand = (...args) => this.l3.toggleExpand(...args)
    this.expandTo = (...args) => this.l3.expandTo(...args)
    this.focusNode = (...args) => this.l4.focusNode(...args)
  }

  async init() {
    await this.l2.search('')
    this.l3.generateVisibleNodes()
  }

  get visibleNodes() {
    return {
      nodes: this.l3.nodes,
      depths: this.l3.depths,
      expandedNodes: this.l3.expandedNodes,
      focusedNode: this.l4.focusedNode,
    }
  }
}