import GitHubHelper from 'utils/GitHubHelper'

const nodeTemplate = {
  name: null,
  path: null,
  mode: null,
  type: null,
  sha: null,
  url: null,
}

function sortFoldersToFront(root) {
  const isFolder = node => node.type === 'tree'
  const isNotFolder = node => !isFolder(node)
  function depthFirstSearch(root) {
    const nodes = root.contents
    if (nodes) {
      nodes.splice(0, Infinity, ...nodes.filter(isFolder), ...nodes.filter(isNotFolder))
      nodes.forEach(depthFirstSearch)
    }
    return root
  }
  return depthFirstSearch(root)
}

function setParentNode(root, parent = null) {
  root.parent = parent
  if (root.contents) {
    root.contents.forEach(node => setParentNode(node, root))
  }
}

function findGitModules(root) {
  if (root.contents) {
    const modulesFile = root.contents.find(content => content.name === '.gitmodules')
    if (modulesFile) {
      return modulesFile
    }
  }
  return null
}

function parse(treeData, metaData) {
  const { tree } = treeData

  // nodes are created from items and put onto tree
  const pathToNode = new Map()
  const pathToItem = new Map()

  const root = { ...nodeTemplate, name: '', path: '', contents: [] }
  pathToNode.set('', root)

  tree.forEach(item => pathToItem.set(item.path, item))
  tree.forEach(item => {
    // bottom-up search for the deepest node created
    let path = item.path
    const itemsToCreateTreeNode = []
    while (path !== '' && !pathToNode.has(path)) {
      itemsToCreateTreeNode.push(pathToItem.get(path))
      // 'a/b' -> 'a'
      // 'a' -> ''
      path = path.substring(0, path.lastIndexOf('/'))
    }

    // top-down create nodes
    while (itemsToCreateTreeNode.length) {
      const item = itemsToCreateTreeNode.pop()
      const node = {
        ...nodeTemplate,
        ...item,
        name: item.path.replace(/^.*\//, ''),
        url: item.url
          ? GitHubHelper.getUrlForRedirect(metaData, item.type, item.path)
          : null,
        contents: item.type === 'tree' ? [] : null,
      }
      pathToNode.get(path).contents.push(node)
      pathToNode.set(node.path, node)
      path = node.path
    }
  })

  setParentNode(root)
  
  return {
    gitModules: findGitModules(root),
    root: sortFoldersToFront(root),
  }
}

export default {
  parse,
}
