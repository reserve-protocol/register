import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackActivityEvent } from '../activity-events'

const fetchMock = vi.fn<typeof fetch>(async () =>
  new Response(null, { status: 202 })
)

beforeEach(() => {
  sessionStorage.clear()
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    '00000000-0000-4000-8000-000000000001'
  )
})

describe('trackActivityEvent', () => {
  it('adds a stable browser-session id and sends a keepalive request', async () => {
    await trackActivityEvent({
      type: 'wallet_connected',
      wallet: '0x1111111111111111111111111111111111111111',
      chainId: 8453,
      connector: 'injected',
    })
    await trackActivityEvent({
      type: 'video_played',
      chainId: 8453,
      dtfAddress: '0x2222222222222222222222222222222222222222',
      videoId: 'abcdefghijk',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.reserve.org/v1/activity-events',
      expect.objectContaining({ method: 'POST', keepalive: true })
    )
    const first = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
    const second = JSON.parse(fetchMock.mock.calls[1][1]?.body as string)
    expect(first.sessionId).toBe('00000000-0000-4000-8000-000000000001')
    expect(second.sessionId).toBe(first.sessionId)
    expect(first).not.toHaveProperty('country')
    expect(first).not.toHaveProperty('ip')
  })

  it('does not throw when analytics delivery fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await expect(
      trackActivityEvent({
        type: 'video_played',
        chainId: 1,
        dtfAddress: '0x2222222222222222222222222222222222222222',
        videoId: 'abcdefghijk',
      })
    ).resolves.toBeUndefined()
  })
})
