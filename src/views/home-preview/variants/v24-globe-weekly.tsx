import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import V18Page from '../shared/v18-page'

const V24GlobeWeekly = () => (
  <V18Page
    cardShadow={false}
    sortTooltips
    scale="week"
    left={<AnimLeft anim={<EusdGlobe />} />}
  />
)

export default V24GlobeWeekly
