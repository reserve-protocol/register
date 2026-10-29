import { IndexDTFFeatureCard } from '@/views/home/components/highlighted-dtfs/feature-card'
import { toHighlightedDtf } from '@/views/home/components/highlighted-dtfs/utils'
import type { FeaturedDTFItem } from '@/views/home/hooks/use-featured-dtfs'
import featuredSnapshot from '../../../../../../e2e/snapshots/shared/featured-dtfs.json'
import buildoutIcon from './buildout.svg'

const source = featuredSnapshot.data.items
  .buildout?.[0] as unknown as FeaturedDTFItem

const featuredCard = toHighlightedDtf({
  key: 'buildout',
  versions: [
    {
      ...source,
      brand: { ...source.brand, icon: buildoutIcon },
    },
  ],
})!

export function FeaturedCardPreview() {
  return (
    <div data-story-featured-card className="mx-auto w-full max-w-md">
      <IndexDTFFeatureCard dtf={featuredCard} />
    </div>
  )
}
