import { useAtomValue } from 'jotai'
import { LazyExoticComponent, Suspense, useEffect } from 'react'
import { PreloadableComponent } from 'react-lazy-with-preload'
import { selectedRTokenAtom } from 'state/atoms'
import { Flex, Spinner } from 'theme-ui'

const Fallback = () => (
  <Flex
    sx={{
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '80vh',
    }}
  >
    <Spinner size={24} />
  </Flex>
)

const PreloadComponent = ({
  element: Element,
}: {
  element: PreloadableComponent<() => JSX.Element>
}) => {
  const selectedRToken = useAtomValue(selectedRTokenAtom)

  useEffect(() => {
    if (selectedRToken) {
      Element.preload()
    }
  }, [!!selectedRToken])

  return (
    <Suspense fallback={<Fallback />}>
      <Element />
    </Suspense>
  )
}

export const LazyComponent = ({
  element: Element,
}: {
  element: LazyExoticComponent<() => JSX.Element>
}) => (
  <Suspense fallback={<Fallback />}>
    <Element />
  </Suspense>
)

export default PreloadComponent
