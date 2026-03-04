import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { Provider as JotaiProvider } from 'jotai'
import { ReactElement, ReactNode } from 'react'

/**
 * Creates a QueryClient configured for testing:
 * - No retries (fail fast)
 * - No caching (isolated tests)
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

/**
 * Creates a wrapper component with all providers needed for testing.
 * Each test gets a fresh QueryClient instance.
 */
export function createWrapper() {
  const queryClient = createTestQueryClient()

  return function Wrapper({ children }: WrapperProps) {
    return (
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </JotaiProvider>
    )
  }
}

/**
 * Custom render function that wraps component with all providers.
 * Use this instead of @testing-library/react's render.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: createWrapper(), ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render with our custom version
export { customRender as render }
