import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useReadContract: () => ({ data: undefined }),
}))

import { SetFeeRecipientsPreview } from '../dtf-settings-preview'

const decodedCalldata = {
  data: [
    [
      {
        recipient: '0x2222222222222222222222222222222222222222',
        portion: 10n ** 18n,
      },
    ],
  ],
} as any

const renderPreview = (platformFee: number) => {
  const store = createStore()
  store.set(indexDTFAtom, {
    chainId: 8453,
    deployer: '0x1111111111111111111111111111111111111111',
    stToken: { id: '0x2222222222222222222222222222222222222222' },
  } as any)
  store.set(indexDTFFeeAtom, platformFee)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  return render(
    <SetFeeRecipientsPreview decodedCalldata={decodedCalldata} />,
    { wrapper }
  )
}

describe('SetFeeRecipientsPreview platform-fee guard (B2)', () => {
  it('renders Unavailable at platformFee=100 (no numeric allocation)', () => {
    const { queryByTestId } = renderPreview(100)
    expect(queryByTestId('settings-preview-fee-unavailable')).not.toBeNull()
  })

  it('renders the numeric split for a displayable fee', () => {
    const { queryByTestId } = renderPreview(50)
    expect(queryByTestId('settings-preview-fee-unavailable')).toBeNull()
  })
})
