import { AnimLeft } from '../shared/grid-left'
import { EusdStreams } from '../shared/hero-anims'
import V18Page from '../shared/v18-page'

const V22Streams = () => (
  <V18Page cardShadow={false} left={<AnimLeft anim={<EusdStreams />} />} />
)

export default V22Streams
