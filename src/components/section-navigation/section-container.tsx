import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { navigationIndexAtom } from './atoms'
import useSectionNavigate from './use-section-navigate'

const SectionContainer = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
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

  return <div {...props}>{children}</div>
}

export default SectionContainer
