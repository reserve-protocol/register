import { atom } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Box, BoxProps } from 'theme-ui'
import { navigationIndexAtom } from './atoms'

interface Props extends BoxProps {
  navigationIndex: number
  threshold?: number
}

const updateSectionAtom = atom(null, (get, set, section: [boolean, number]) => {
  const currentIndex = get(navigationIndexAtom)
  const [inView, navigationIndex] = section
  const status = currentIndex.indexOf(navigationIndex)

  if (inView && status === -1) {
    set(navigationIndexAtom, [...currentIndex, navigationIndex])
  } else if (!inView && status !== -1) {
    set(navigationIndexAtom, [
      ...currentIndex.slice(0, status),
      ...currentIndex.slice(status + 1),
    ])
  }
})

// TODO: Store ref on atom? this would allow to use it directly rather than use js for the scrolling
const SectionWrapper = ({
  navigationIndex,
  threshold = 0.6,
  ...props
}: Props) => {
  const { ref, inView } = useInView({ threshold })
  const updateNavigationIndex = useSetAtom(updateSectionAtom)

  useEffect(() => {
    updateNavigationIndex([inView, navigationIndex])
  }, [inView])

  return <Box {...props} ref={ref} id={`section-${navigationIndex}`} />
}

export default SectionWrapper
