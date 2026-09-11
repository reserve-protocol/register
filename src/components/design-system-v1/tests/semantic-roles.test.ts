import { expect, test } from 'vitest'
import * as semantic from '@/components/design-system-v1/semantic-roles'

test('distinguishes static, keyboard-visible and group focus at one owner', () => {
  expect(semantic).toHaveProperty('v1SemanticRoles.focus', {
    staticOnContent: 'ring-2 ring-ring ring-offset-2 ring-offset-card',
    visibleOnContent:
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
    visibleInset:
      'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    withinGroup:
      'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card',
  })
})
