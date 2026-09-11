import { PRIMARY_COMPONENT_GROUPS } from './component-catalog-primary'
import { SUPPORT_COMPONENT_GROUPS } from './component-catalog-support'
import { getFoundationItem } from './foundation-catalog'
import type { ComponentItem } from './catalog-types'

export const COMPONENT_GROUPS = [
  ...PRIMARY_COMPONENT_GROUPS,
  ...SUPPORT_COMPONENT_GROUPS,
]

export const COMPONENT_ITEMS = COMPONENT_GROUPS.flatMap((group) => group.items)

export const getComponentDisposition = (item: ComponentItem) => ({
  authority: {
    status: item.designAuthority,
    sources:
      item.contextSources?.filter(
        ({ role }) => role === 'authority' || role === 'accepted-decision'
      ) ?? [],
  },
  implementation: {
    status: item.implementationStatus,
    source: item.implementationSource,
  },
  output: { status: item.outputStatus, composition: item.compositionSource },
  adoption: item.adoptionStatus,
  review: item.review,
})

export const getComponentItem = (id?: string) => {
  const group = COMPONENT_GROUPS.find((candidate) =>
    candidate.items.some((item) => item.id === id)
  )
  return { group, item: group?.items.find((candidate) => candidate.id === id) }
}

export const getComponentContextRoute = (id?: string) => {
  const { group, item } = getComponentItem(id)

  if (!group || !item) return undefined

  return {
    target: item,
    disposition: getComponentDisposition(item),
    foundations: group.foundationDependencies.map((foundationId) => {
      const foundation = getFoundationItem(foundationId)

      if (!foundation) {
        throw new Error(
          `Unknown foundation dependency "${foundationId}" for "${item.id}"`
        )
      }

      return foundation
    }),
    implementationSource: item.implementationSource,
    contextSources: item.contextSources ?? [],
  }
}
