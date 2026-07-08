import { getFolioRoute } from '@/utils'
import { type FeaturedIdentity } from '@/utils/featured-dtfs'

export { FEATURED_DTFS, type FeaturedIdentity } from '@/utils/featured-dtfs'

// Featured DTFs resolve by their symbol alias (e.g. /bsc/index-dtf/photon),
// matching the live card's getHighlightedDtfRoute so first-paint links line up.
export const getFeaturedRoute = (dtf: FeaturedIdentity) =>
  getFolioRoute(dtf.symbol, dtf.chainId)
