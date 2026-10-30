import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import V18Page from '../shared/v18-page'

const V21Globe = () => (
  <V18Page
    cardShadow={false}
    sortTooltips
    left={<AnimLeft anim={<EusdGlobe />} />}
  />
)

export default V21Globe
