import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChainId } from '@/utils/chains'
import { fetchZapQuote, isClientError } from '../api/quote-providers'

const params = {
  quoteSource: 'best' as const,
  reserveEndpoint: 'https://api.reserve.org/api/zapper/1/swap?x=1',
  chainId: ChainId.Mainnet,
  signer: '0x0000000000000000000000000000000000000001' as const,
  tokenIn: '0x0000000000000000000000000000000000000002' as const,
  tokenOut: '0x0000000000000000000000000000000000000003' as const,
  amountIn: '1000',
  slippage: 100,
}

const ok = (amountOut: string) =>
  Response.json({ status: 'success', result: { amountOut } })

const stubFetch = (handler: (url: string) => Response) => {
  const fetchMock = vi.fn(async (url: string) => handler(url))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('fetchZapQuote', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('surfaces the zapper JSON error and does not treat a 4xx as retryable', async () => {
    stubFetch(() =>
      Response.json({ status: 'error', error: 'no route found' }, { status: 422 })
    )

    const error = await fetchZapQuote({ ...params, quoteSource: 'zap' }).catch(
      (e) => e
    )

    expect(error.message).toBe('no route found')
    expect(isClientError(error)).toBe(true)
  })

  it('keeps 5xx failures retryable and falls back to the plain-text body', async () => {
    stubFetch(
      () =>
        new Response('upstream timeout', {
          status: 504,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        })
    )

    const error = await fetchZapQuote({ ...params, quoteSource: 'zap' }).catch(
      (e) => e
    )

    expect(error.message).toBe('upstream timeout')
    expect(isClientError(error)).toBe(false)
  })

  it('only asks Enso on Arbitrum, even when the native zap is selected', async () => {
    const fetchMock = stubFetch(() => ok('5'))

    const { selected, attempted } = await fetchZapQuote({
      ...params,
      quoteSource: 'zap',
      chainId: ChainId.Arbitrum,
    })

    expect(selected.provider).toBe('enso')
    expect(attempted).toEqual(['enso'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('enso/swap')
  })

  it('stays retryable when the zapper answers 4xx but Enso fails transiently', async () => {
    stubFetch((url) =>
      url.includes('enso/swap')
        ? new Response('bad gateway', { status: 502 })
        : Response.json({ status: 'error', error: 'no route found' }, { status: 422 })
    )

    const error = await fetchZapQuote(params).catch((e) => e)

    expect(isClientError(error)).toBe(false)
  })

  it('stops retrying when every provider answers 4xx', async () => {
    stubFetch(() =>
      Response.json({ status: 'error', error: 'no route found' }, { status: 422 })
    )

    const error = await fetchZapQuote(params).catch((e) => e)

    expect(error.message).toBe('no route found')
    expect(isClientError(error)).toBe(true)
  })

  it('picks the larger quote across both providers elsewhere', async () => {
    stubFetch((url) => (url.includes('enso/swap') ? ok('5') : ok('7')))

    const { selected, attempted } = await fetchZapQuote(params)

    expect(selected.provider).toBe('reserve')
    expect(attempted).toEqual(['reserve', 'enso'])
  })
})
