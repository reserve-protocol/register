import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Box, BoxProps } from 'theme-ui'
import { navigationIndexAtom } from '../atoms'

interface Props extends BoxProps {
  navigationIndex: number
}

const SectionWrapper = ({ navigationIndex, ...props }: Props) => {
  const { ref, inView } = useInView({ threshold: 0.5 })
  const [currentIndex, updateNavigationIndex] = useAtom(navigationIndexAtom)

  useEffect(() => {
    const status = currentIndex.indexOf(navigationIndex)

    if (inView && status === -1) {
      updateNavigationIndex([...currentIndex, navigationIndex])
    } else if (!inView && status !== -1) {
      updateNavigationIndex([
        ...currentIndex.slice(0, status),
        ...currentIndex.slice(status + 1),
      ])
    }
  }, [inView])

  return <Box {...props} ref={ref} id={`section-${navigationIndex}`} />
}

export default SectionWrapper
