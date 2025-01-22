import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Fingerprint } from 'lucide-react'

const IndexAboutOverview = () => {
  const data = useAtomValue(indexDTFAtom)
  const fee = useAtomValue(indexDTFFeeAtom)

  console.log('fee', fee)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2  mb-24">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Fingerprint size={20} />
        </div>

        {fee === undefined ? (
          <Skeleton className="w-60 h-6" />
        ) : (
          <div className="flex gap-4">
            <div className="flex gap-1">
              <Box variant="circle">
                <ArrowUpRight size={12} />
              </Box>
              <span className="text-legend">TVL Fee:</span>
              <span className="font-bold">{formatPercentage(fee)}</span>
            </div>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-4xl mb-2">About this token</h2>
        {!data ? (
          <div>
            <Skeleton className="w-full h-20" />
          </div>
        ) : (
          <p className="text-legend">Display mandate HERE!</p>
        )}
      </div>
    </Card>
  )
}

export default IndexAboutOverview
