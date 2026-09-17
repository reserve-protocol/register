import { cleanup, render, renderHook, screen } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const router = vi.hoisted(() => ({
  location: {
    pathname: '/internal/design-system/patterns',
    search: '?theme=dark&charts.state=empty',
    hash: '#charts',
  },
  navigate: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useLocation: () => router.location,
  useNavigate: () => router.navigate,
}))

import DocumentationSpecimenCanvas from '../documentation-specimen-canvas'
import {
  createDocumentationSpecimenHref,
  parseDocumentationSpecimenState,
  resetDocumentationSpecimenSearch,
  updateDocumentationSpecimenSearch,
  useDocumentationSpecimenState,
} from '../use-documentation-specimen-state'

const schema = {
  operation: {
    defaultValue: 'mint',
    values: ['mint', 'redeem'],
  },
  state: {
    defaultValue: 'ready',
    values: ['ready', 'empty'],
  },
} as const

afterEach(cleanup)

beforeEach(() => {
  router.navigate.mockReset()
  router.location = {
    pathname: '/internal/design-system/patterns',
    search: '?theme=dark&charts.state=empty',
    hash: '#charts',
  }
})

describe('documentation specimen query state', () => {
  it('restores valid section state and defaults absent dimensions', () => {
    const parsed = parseDocumentationSpecimenState(
      'charts',
      schema,
      '?theme=dark&tables.state=loading&charts.state=empty'
    )

    expect(parsed.state).toEqual({ operation: 'mint', state: 'empty' })
    expect(parsed.fallbacks).toEqual([])
  })

  it('falls back from unknown values and records the visible explanation', () => {
    const parsed = parseDocumentationSpecimenState(
      'charts',
      schema,
      '?charts.operation=swap&charts.state=empty'
    )

    expect(parsed.state).toEqual({ operation: 'mint', state: 'empty' })
    expect(parsed.fallbacks).toEqual([
      {
        dimension: 'operation',
        requestedValue: 'swap',
        fallbackValue: 'mint',
      },
    ])
  })

  it('updates only the requested namespaced value and omits its default', () => {
    expect(
      updateDocumentationSpecimenSearch(
        'charts',
        schema,
        '?theme=dark&tables.state=loading&charts.state=empty',
        'operation',
        'redeem'
      )
    ).toBe(
      '?theme=dark&tables.state=loading&charts.state=empty&charts.operation=redeem'
    )

    expect(
      updateDocumentationSpecimenSearch(
        'charts',
        schema,
        '?theme=dark&charts.operation=redeem&charts.state=empty',
        'operation',
        'mint'
      )
    ).toBe('?theme=dark&charts.state=empty')
  })

  it('resets all and only the current section namespace', () => {
    expect(
      resetDocumentationSpecimenSearch(
        'charts',
        '?theme=dark&charts.state=empty&charts.future=x&tables.state=loading'
      )
    ).toBe('?theme=dark&tables.state=loading')
  })

  it('builds a stable path, query, and hash URL', () => {
    expect(
      createDocumentationSpecimenHref({
        pathname: '/internal/design-system/patterns',
        search: '?charts.state=empty',
        hash: '#charts',
      })
    ).toBe('/internal/design-system/patterns?charts.state=empty#charts')
  })

  it('replaces query state through the router without claiming scroll', () => {
    const { result } = renderHook(() =>
      useDocumentationSpecimenState('charts', schema)
    )

    expect(result.current.state).toEqual({ operation: 'mint', state: 'empty' })
    expect(result.current.href).toBe(
      '/internal/design-system/patterns?theme=dark&charts.state=empty#charts'
    )

    act(() => result.current.setValue('operation', 'redeem'))

    expect(router.navigate).toHaveBeenCalledWith(
      {
        pathname: '/internal/design-system/patterns',
        search: '?theme=dark&charts.state=empty&charts.operation=redeem',
        hash: '#charts',
      },
      { replace: true, preventScrollReset: true }
    )
  })

  it('keeps malformed default-rendering state resettable and cleanable', () => {
    router.location.search =
      '?theme=dark&charts.operation=swap&charts.state=unknown'
    const { result } = renderHook(() =>
      useDocumentationSpecimenState('charts', schema)
    )

    expect(result.current.state).toEqual({ operation: 'mint', state: 'ready' })
    expect(result.current.fallbacks).toHaveLength(2)
    expect(result.current.isDefault).toBe(false)

    act(() => result.current.reset())

    expect(router.navigate).toHaveBeenCalledWith(
      {
        pathname: '/internal/design-system/patterns',
        search: '?theme=dark',
        hash: '#charts',
      },
      { replace: true, preventScrollReset: true }
    )
  })
})

const button = (label: string): ReactNode => <button>{label}</button>

describe('DocumentationSpecimenCanvas', () => {
  it('keeps documentation controls outside the named host and specimen', () => {
    const { container } = render(
      <DocumentationSpecimenCanvas
        host={{
          name: 'Portfolio overview',
          backgroundOwner: 'Application shell',
          insetOwner: 'Portfolio page',
        }}
        controls={{
          state: button('State control'),
          family: button('Family control'),
          viewport: button('Viewport control'),
          operation: button('Operation control'),
          identity: button('Identity control'),
          step: button('Step control'),
        }}
        reset={button('Reset control')}
        link={button('Link control')}
      >
        <div>Canonical specimen</div>
      </DocumentationSpecimenCanvas>
    )

    const documentation = container.querySelector<HTMLElement>(
      '[data-documentation-layer]'
    )!
    const controls = container.querySelector<HTMLElement>(
      '[data-specimen-control-bar]'
    )!
    const host = container.querySelector<HTMLElement>('[data-host-context]')!
    const specimen = container.querySelector<HTMLElement>(
      '[data-specimen-boundary]'
    )!

    expect(documentation).toContainElement(controls)
    expect(documentation).toContainElement(host)
    expect(host).toContainElement(specimen)
    expect(host).not.toContainElement(controls)
    expect(specimen).not.toContainElement(controls)
    expect(host).toHaveAttribute('data-host-context', 'Portfolio overview')
    expect(host).toHaveTextContent(
      'Portfolio overview host · Background: Application shell · Inset: Portfolio page'
    )
    expect(screen.getByText('Canonical specimen')).toBeVisible()
  })

  it('renders applicable slots in fixed semantic order with readable targets', () => {
    const { container } = render(
      <DocumentationSpecimenCanvas
        host={{
          name: 'Yield card',
          backgroundOwner: 'Yield page',
          insetOwner: 'Metric card',
        }}
        controls={{
          viewport: button('Viewport control'),
          family: button('Family control'),
          state: button('State control'),
        }}
        reset={button('Reset control')}
        link={button('Link control')}
      >
        Specimen
      </DocumentationSpecimenCanvas>
    )

    const slots = Array.from(
      container.querySelectorAll('[data-specimen-control-slot]')
    )

    expect(
      slots.map((slot) => slot.getAttribute('data-specimen-control-slot'))
    ).toEqual(['family', 'state', 'viewport', 'reset', 'link'])
    expect(screen.queryByText('Operation')).toBeNull()
    expect(screen.queryByText('Step')).toBeNull()
    expect(screen.queryByText('Identity')).toBeNull()

    for (const slot of slots) {
      expect(slot.querySelector('p')).toHaveClass('text-xs')
      expect(slot.querySelector('[data-specimen-control-target]')).toHaveClass(
        'min-h-11'
      )
    }
  })

  it('announces fallbacks while retaining the three layers without controls', () => {
    const { container } = render(
      <DocumentationSpecimenCanvas
        host={{
          name: 'Table page',
          backgroundOwner: 'Application shell',
          insetOwner: 'Table region',
        }}
        fallbacks={[
          {
            dimension: 'state',
            requestedValue: 'stale-state',
            fallbackValue: 'ready',
          },
        ]}
      >
        Table specimen
      </DocumentationSpecimenCanvas>
    )

    expect(container.querySelector('[data-documentation-layer]')).not.toBeNull()
    expect(container.querySelector('[data-host-context]')).not.toBeNull()
    expect(container.querySelector('[data-specimen-boundary]')).not.toBeNull()
    expect(container.querySelector('[data-specimen-control-bar]')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unavailable state value “stale-state”; showing “ready”.'
    )
  })
})
