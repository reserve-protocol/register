import { render } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useReadContract: () => ({ data: undefined }),
}))

const sdk = vi.hoisted(() => ({ selfFee: undefined as undefined | { formatted: string }, selfFeeError: false }))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@reserve-protocol/react-sdk')>()),
  useIndexDtfIdentity: () => ({ chainId: 8453, address: '0x4444444444444444444444444444444444444444' }),
  useIndexDtfSelfFee: (params: unknown) => ({ data: params ? sdk.selfFee : undefined, isError: sdk.selfFeeError }),
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

describe('SetFeeRecipientsPreview platform-fee guard', () => {
  it('renders Unavailable at platformFee=100 (no numeric allocation)', () => {
    const { queryByTestId } = renderPreview(100)
    expect(queryByTestId('settings-preview-fee-unavailable')).not.toBeNull()
  })

  it('renders the numeric split for a displayable fee', () => {
    const { queryByTestId } = renderPreview(50)
    expect(queryByTestId('settings-preview-fee-unavailable')).toBeNull()
  })
})

describe('SetFeeRecipientsPreview on Folio 6.0 (two recipient tables)', () => {
  const IMMUTABLE = '0x3333333333333333333333333333333333333333'

  it('lists every immutable recipient, which governance can never remove', () => {
    sdk.selfFee = { formatted: '0' }
    const store = createStore()
    store.set(indexDTFAtom, {
      chainId: 8453,
      deployer: '0x1111111111111111111111111111111111111111',
      stToken: { id: '0x2222222222222222222222222222222222222222' },
    } as any)
    store.set(indexDTFFeeAtom, 50)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    )
    const { getAllByTestId } = render(
      <SetFeeRecipientsPreview
        decodedCalldata={
          {
            data: [
              [{ recipient: '0x2222222222222222222222222222222222222222', portion: 7n * 10n ** 17n }],
              [{ recipient: IMMUTABLE, portion: 3n * 10n ** 17n }],
            ],
          } as any
        }
      />,
      { wrapper }
    )

    const rows = getAllByTestId('settings-preview-immutable-recipient')
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('0x3333')
    expect(rows[0].textContent).toContain('15.00%')
  })
})

describe('SetFeeRecipientsPreview shares of total fees (same basis as Details)', () => {
  const GOVERNANCE = '0x2222222222222222222222222222222222222222'
  const IMMUTABLE = '0x3333333333333333333333333333333333333333'
  const twoTables = {
    data: [
      [{ recipient: GOVERNANCE, portion: 7n * 10n ** 17n }],
      [{ recipient: IMMUTABLE, portion: 3n * 10n ** 17n }],
    ],
  } as any

  const renderWithCalls = (calls?: any[]) => {
    const store = createStore()
    store.set(indexDTFAtom, {
      chainId: 8453,
      deployer: '0x1111111111111111111111111111111111111111',
      stToken: { id: GOVERNANCE },
    } as any)
    store.set(indexDTFFeeAtom, 50)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    )
    return render(<SetFeeRecipientsPreview decodedCalldata={twoTables} calls={calls} />, {
      wrapper,
    })
  }

  it('takes the holder share proposed in the same proposal', () => {
    sdk.selfFee = { formatted: '0' }
    const { getByTestId, getAllByTestId } = renderWithCalls([
      { signature: 'setFolioSelfFee', data: [2n * 10n ** 17n] },
      { signature: 'setFeeRecipients', data: twoTables.data },
    ])

    expect(getByTestId('settings-preview-holder-share').textContent).toContain('10.00%')
    expect(getByTestId('settings-preview-governance-share').textContent).toContain('28.00%')
    expect(getAllByTestId('settings-preview-immutable-recipient')[0].textContent).toContain('12.00%')
  })

  it('uses the current holder share when the proposal does not change it', () => {
    sdk.selfFee = { formatted: '0.2' }
    const { getByTestId } = renderWithCalls([{ signature: 'setFeeRecipients', data: twoTables.data }])

    expect(getByTestId('settings-preview-holder-share').textContent).toContain('10.00%')
    expect(getByTestId('settings-preview-governance-share').textContent).toContain('28.00%')
  })

  it('says the split is unavailable when the current holder share cannot be read', () => {
    sdk.selfFee = undefined
    sdk.selfFeeError = true
    const { getByTestId } = renderWithCalls([{ signature: 'setFeeRecipients', data: twoTables.data }])

    expect(getByTestId('settings-preview-fee-unavailable')).toBeTruthy()
    sdk.selfFeeError = false
  })
})
