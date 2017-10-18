export function findOneLevelNodes(node, ary) {
    for (const nodeItem of ary) {
      if (nodeItem === node.id) {
        return true;
      }
    }
    return false;
  }