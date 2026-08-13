import { PRIMARY_COMPONENT_GROUPS } from './component-catalog-primary'
import { SUPPORT_COMPONENT_GROUPS } from './component-catalog-support'

export const COMPONENT_GROUPS = [
  ...PRIMARY_COMPONENT_GROUPS,
  ...SUPPORT_COMPONENT_GROUPS,
]

export const COMPONENT_ITEMS = COMPONENT_GROUPS.flatMap((group) => group.items)

export const getComponentItem = (id?: string) => {
  const group = COMPONENT_GROUPS.find((candidate) =>
    candidate.items.some((item) => item.id === id)
  )
  return { group, item: group?.items.find((candidate) => candidate.id === id) }
}
