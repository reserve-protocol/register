import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({ t: (value: unknown) => String(value) }),
}))

import VideoModal from '..'

const playingMessage = JSON.stringify({ event: 'onStateChange', info: 1 })

describe('VideoModal playback', () => {
  it('reports a trusted YouTube PLAYING message once per open', async () => {
    const onPlay = vi.fn()
    const user = userEvent.setup()
    render(
      <VideoModal video="abcdefghijk" onPlay={onPlay}>
        <button>Watch</button>
      </VideoModal>
    )

    await user.click(screen.getByRole('button', { name: 'Watch' }))
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    const source = iframe!.contentWindow
    expect(source).toBeTruthy()

    fireEvent.load(iframe!)
    window.dispatchEvent(
      new MessageEvent('message', {
        data: playingMessage,
        origin: 'https://evil.example',
        source,
      })
    )
    expect(onPlay).not.toHaveBeenCalled()

    for (let i = 0; i < 2; i++) {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: playingMessage,
          origin: 'https://www.youtube-nocookie.com',
          source,
        })
      )
    }
    expect(onPlay).toHaveBeenCalledTimes(1)
  })
})
