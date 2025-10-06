import { useSetAtom } from 'jotai'
import { useSearchParams } from 'react-router-dom'
import { Box, BoxProps } from 'theme-ui'
import { navigationIndexAtom } from './atoms'
import { useEffect } from 'react'
import useSectionNavigate from './useSectionNavigate'

const SectionContainer = ({ children, ...props }: BoxProps) => {
  let [searchParams] = useSearchParams()
  const navigate = useSectionNavigate()
  const setNavigationIndex = useSetAtom(navigationIndexAtom)

  useEffect(() => {
    const section = searchParams.get('section')

    if (section) {
      navigate(`section-${section}`)
    }

    return () => setNavigationIndex([])
  }, [])

  return <Box {...props}>{children}</Box>
}

export default SectionContainer
