import { AnimLeft } from '../shared/grid-left'
import { EusdVortex } from '../shared/hero-anims'
import V18Page from '../shared/v18-page'

const V20Vortex = () => (
  <V18Page cardShadow={false} left={<AnimLeft anim={<EusdVortex />} />} />
)

export default V20Vortex
