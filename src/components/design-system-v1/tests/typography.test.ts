import { expect, test } from 'vitest'
import { v1Typography } from '../typography'

test('exports the complete reviewed scale without changing existing role keys', () => {
  expect(v1Typography).toEqual({
    display:
      'text-[40px] font-light leading-[46px] tracking-[-0.015em] sm:text-5xl sm:leading-[54px]',
    pageTitle: 'text-[32px] font-light leading-[38px] tracking-[-0.01em]',
    sectionTitle: 'text-2xl font-light leading-[30px]',
    lead: 'text-xl font-light leading-7',
    panelTitle: 'text-xl font-medium leading-[26px]',
    itemTitle: 'text-base font-medium leading-6',
    body: 'text-base font-light leading-6',
    label: 'text-sm font-medium leading-5',
    supporting: 'text-sm font-light leading-5',
    auxiliary: 'text-xs font-light leading-4',
  })
})
