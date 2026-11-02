import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import { mockData, UglycashDataProvider } from '../shared/uglycash-data'
import { useUglycashApi } from '../shared/use-uglycash-api'
import V18Page from '../shared/v18-page'

// Mock values never render while loading: cards only read them to keep their shape behind the skeletons.
const LOADING = { ...mockData, status: 'loading' as const }

const V25Live = () => {
  const { data, isError } = useUglycashApi()

  return (
    <UglycashDataProvider value={data ?? LOADING}>
      <V18Page
        cardShadow={false}
        sortTooltips
        dataState={isError && !data ? 'error' : 'ready'}
        left={<AnimLeft anim={<EusdGlobe />} />}
      />
    </UglycashDataProvider>
  )
}

export default V25Live
