import { FlowLeftV19 } from '../shared/grid-left'
import V18Page from '../shared/v18-page'

const V23Weekly = () => (
  <V18Page
    cardShadow={false}
    sortTooltips
    scale="week"
    left={<FlowLeftV19 />}
  />
)

export default V23Weekly
