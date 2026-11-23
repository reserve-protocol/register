import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { proposalTypeAtom, type ProposalType } from '../../atoms'
import { useProposalStartStep } from '../use-proposal-start-step'

const renderStartStep = (type: ProposalType) => {
  const store = createStore()
  store.set(proposalTypeAtom, type)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <Provider store={store}>{children}</Provider>
    </I18nProvider>
  )
  return renderHook(() => useProposalStartStep(), { wrapper }).result.current
}

describe('useProposalStartStep', () => {
  beforeAll(() => {
    i18n.loadAndActivate({ locale: 'en', messages: {} })
  })

  it('starts the voting delay for a standard proposal', () => {
    expect(renderStartStep('standard')).toBe('Voting delay begins')
  })

  it('starts the veto delay for a fast proposal', () => {
    expect(renderStartStep('optimistic')).toBe('Veto delay begins')
  })
})
