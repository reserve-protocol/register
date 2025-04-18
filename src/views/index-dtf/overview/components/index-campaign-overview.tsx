import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { BadgePercent, CalendarRange, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDTFCampaign } from '../hooks/use-campaign'

const MerklSvg = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 20 14"
    fill="none"
    xmlns="http://www .w3.org/2000/svg"
  >
    <path d="M17.6278 4.42847H13.342V6.52892H17.6278V4.42847Z" fill="black" />
    <path d="M20.1266 7.92932H15.8408V10.3799H20.1266V7.92932Z" fill="black" />
    <path d="M12.2692 0.577393H7.9834V2.67785H12.2692V0.577393Z" fill="black" />
    <path d="M20.1266 11.7803H15.8408V13.1806H20.1266V11.7803Z" fill="black" />
    <path d="M14.7687 7.92932H10.8401V10.3799H14.7687V7.92932Z" fill="black" />
    <path d="M14.7687 11.7803H10.8401V13.1806H14.7687V11.7803Z" fill="black" />
    <path d="M9.41203 7.92932H5.4834V10.3799H9.41203V7.92932Z" fill="black" />
    <path d="M9.41203 11.7803H5.4834V13.1806H9.41203V11.7803Z" fill="black" />
    <path d="M4.41226 7.92932H0.126465V10.3799H4.41226V7.92932Z" fill="black" />
    <path d="M6.91226 4.42847H2.62646V6.52892H6.91226V4.42847Z" fill="black" />
    <path d="M4.41226 11.7803H0.126465V13.1806H4.41226V11.7803Z" fill="black" />
  </svg>
)

const IndexCampaignOverview = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const campaignData = useDTFCampaign(indexDTF?.id ?? '')

  if (!indexDTF || !campaignData || campaignData.status !== 'LIVE') return null

  return (
    <Card className="p-6">
      <div className="flex items-center gap-1 mb-4">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Coins size={14} />
        </div>
        <CalendarRange size={14} />
        <span className="text-legend">Campaign ends:</span>
        <span>April 1</span>
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        <span className="text-[#805F23]">
          ${formatCurrency(campaignData.dailyRewards)}
        </span>{' '}
        in Daily Payouts
      </h2>
      <p className="text-legend">
        Earn rewards in{' '}
        <a
          href={campaignData.rewardToken?.url}
          target="_blank"
          className="underline"
        >
          {campaignData.rewardToken?.name} ({campaignData.rewardToken?.symbol})
        </a>{' '}
        by simply holding the Base AI Index and claiming your rewards in the
        Merkl UI.
      </p>
      <div className="flex items-center gap-1 mt-2">
        <BadgePercent size={16} /> <span>Current APR:</span>{' '}
        <span className="font-semibold text-[#805F23]">
          {campaignData.apr.toFixed(2)}%
        </span>
      </div>
      <Link to={campaignData.url} target="_blank">
        <Button
          size="lg"
          className="gap-1 mt-4 w-full bg-[#FFBE45] hover:bg-[#FFBE45]/90  text-black"
        >
          <MerklSvg />
          <span>View Merkl Campaign</span>
        </Button>
      </Link>
    </Card>
  )
}

export default IndexCampaignOverview
