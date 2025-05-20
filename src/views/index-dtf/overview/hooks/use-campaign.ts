import { ChainId } from '@/utils/chains'
import { CHAIN_TAGS } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

const rewardTokens = {
  [ChainId.Mainnet]: {
    name: 'ETHPlus',
    symbol: 'ETH+',
    address: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    url: 'https://app.reserve.org/ethereum/token/0xe72b141df173b999ae7c1adcbf60cc9833ce56a8/overview',
  },
  [ChainId.Base]: {
    name: 'Based ETH',
    symbol: 'bsdETH',
    address: '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
    url: 'https://app.reserve.org/base/token/0xcb327b99ff831bf8223cced12b1338ff3aa322ff/overview',
  },
}

export const CAMPAIGN_URL = 'https://reserve.merkl.xyz/users/'

type Response = {
  chainId: number
  apr: number
  identifier: string
  status: string
  dailyRewards: number
  type: string
  depositUrl: string
  lastCampaignCreatedAt: string
}

const useCampaignRewards = () => {
  return useQuery({
    queryKey: ['campaign-rewards'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.merkl.xyz/v4/opportunities/?tags=reserve'
      )
      const data = (await response.json()) as Response[]

      return data.reduce(
        (acc, curr) => {
          if (curr.status !== 'LIVE') {
            return acc
          }

          const match = curr.depositUrl.match(/0x[a-fA-F0-9]{40}/)
          if (!match || match.length === 0) {
            return acc
          }

          const index = match[0].toLowerCase()
          const rewardToken = rewardTokens[curr.chainId]
          acc[index] = {
            ...curr,
            rewardToken,
            url: `https://reserve.merkl.xyz/opportunities/${CHAIN_TAGS[curr.chainId]?.toLowerCase()}/${curr.type}/${curr.identifier}`,
          }
          return acc
        },
        {} as Record<
          string,
          Response & {
            rewardToken?: (typeof rewardTokens)[keyof typeof rewardTokens]
            url: string
          }
        >
      )
    },
  })
}

export const useDTFCampaign = (identifier: string) => {
  const { data: campaignRewards } = useCampaignRewards()
  const campaignData = campaignRewards?.[identifier.toLowerCase()]

  if (!campaignData || campaignData.status !== 'LIVE') return null

  return campaignData
}

export default useCampaignRewards
