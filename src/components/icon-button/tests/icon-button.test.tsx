import { describe, expectTypeOf, it } from 'vitest'

import { type IconButtonProps } from '..'

describe('IconButton', () => {
  it('does not expose Button slotting without a slotted child', () => {
    expectTypeOf<IconButtonProps>().not.toHaveProperty('asChild')
  })
})
