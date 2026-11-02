import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWrapper } from '../../test-utils'
import { useZapDeployQuery } from '../useZapDeployQuery'
import type { ZapDeployBody } from '@/views/yield-dtf/issuance/components/zapV2/api/types'

const payload = { chainId: 8453 } as unknown as ZapDeployBody

const errorFor = async (response: Response) => {
  vi.stubGlobal('fetch', vi.fn(async () => response))

  const { result } = renderHook(
    () => useZapDeployQuery('https://zapper.test/deploy', payload, false),
    { wrapper: createWrapper() }
  )

  await waitFor(() => expect(result.current.isError).toBe(true))
  return result.current.error?.message
}

describe('useZapDeployQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the error from the zapper JSON envelope', async () => {
    const message = await errorFor(
      Response.json(
        { status: 'error', error: 'insufficient liquidity' },
        { status: 422 }
      )
    )

    expect(message).toBe('insufficient liquidity')
  })

  it('shows a plain-text rejection body', async () => {
    const message = await errorFor(
      new Response('basket must have at least 2 assets', {
        status: 400,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    )

    expect(message).toBe('basket must have at least 2 assets')
  })

  it('falls back to the status when the JSON error is not a string', async () => {
    const message = await errorFor(
      Response.json({ status: 'error', error: { code: 42 } }, { status: 500 })
    )

    expect(message).toBe('Error: 500')
  })

  it('falls back to the status for an HTML error page', async () => {
    const message = await errorFor(
      new Response('<html>origin unreachable</html>', {
        status: 530,
        headers: { 'content-type': 'text/html' },
      })
    )

    expect(message).toBe('Error: 530')
  })
})
