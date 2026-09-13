import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { useCurrentScene } from '../../auctions-current/use-scene'

it('applies a guarded browser Back reset even when the URL already names that scene', () => {
  const { result } = renderHook(
    () => ({ scene: useCurrentScene(), navigate: useNavigate() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['/?current=ready', '/?current=hybrid']}>
          {children}
        </MemoryRouter>
      ),
    }
  )
  const root = document.createElement('div')
  const draft = document.createElement('div')
  draft.dataset.guarded = 'true'
  root.append(draft)
  Object.defineProperty(result.current.scene.root, 'current', { value: root })
  act(() => result.current.navigate(-1))
  expect(result.current.scene.scenario).toBe('hybrid')
  expect(result.current.scene.pendingScene).toBe('ready')
  act(() => result.current.scene.confirmScene())
  expect(result.current.scene.scenario).toBe('ready')
  expect(result.current.scene.pendingScene).toBeNull()
})
