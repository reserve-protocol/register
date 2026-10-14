// Page translators move React's text nodes into <font>, then React's DOM calls throw (facebook/react#11538)
export const installTranslationDomGuard = () => {
  if (typeof Node !== 'function') return () => {}

  const { removeChild, insertBefore } = Node.prototype

  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T) {
    if (child.parentNode === this) return removeChild.call(this, child) as T

    console.warn('[translation-dom-guard] removeChild outside parent', child)
    if (child.parentNode && this.contains(child)) {
      removeChild.call(child.parentNode, child)
    }
    return child
  }

  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    node: T,
    child: Node | null
  ) {
    if (!child || child.parentNode === this) {
      return insertBefore.call(this, node, child) as T
    }

    console.warn('[translation-dom-guard] insertBefore outside parent', child)
    let wrapper: Node | null = child
    while (wrapper && wrapper.parentNode !== this) wrapper = wrapper.parentNode
    return wrapper ? (insertBefore.call(this, node, wrapper) as T) : node
  }

  return () => {
    Node.prototype.removeChild = removeChild
    Node.prototype.insertBefore = insertBefore
  }
}
