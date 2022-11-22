import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Box, BoxProps } from 'theme-ui'
import { navigationIndexAtom } from '../atoms'

interface Props extends BoxProps {
  navigationIndex: number
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

const SectionWrapper = ({ navigationIndex, ...props }: Props) => {
  const { ref, inView } = useInView({ threshold: 0.8 })
  const updateNavigationIndex = useUpdateAtom(updateSectionAtom)

  useEffect(() => {
    updateNavigationIndex([inView, navigationIndex])
  }, [inView])

  return <Box {...props} ref={ref} id={`section-${navigationIndex}`} />
}

export default SectionWrapper
