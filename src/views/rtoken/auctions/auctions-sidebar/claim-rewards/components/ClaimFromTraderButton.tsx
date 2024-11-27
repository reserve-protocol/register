import { Trans, t } from '@lingui/macro'
import RevenueTrader from 'abis/RevenueTrader'
import { ExecuteButton } from 'components/button/TransactionButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { rTokenContractsAtom, walletAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { Trader } from 'types'
import { formatCurrency } from 'utils'
import { Address, encodeFunctionData } from 'viem'
import { auctionSessionAtom } from '@/views/rtoken/auctions/atoms'
import { traderRewardsAtom } from '../atoms'
import { RewardTokenWithCollaterals } from '../types'

const ClaimFromTraderButton = ({
  trader,
  erc20s,
}: {
  trader: Trader
  erc20s: RewardTokenWithCollaterals[]
}) => {
  const rTokenContracts = useAtomValue(rTokenContractsAtom)
  const availableRewards = useAtomValue(traderRewardsAtom)
  const wallet = useAtomValue(walletAtom)
  const setSession = useSetAtom(auctionSessionAtom)

  const claimAmount = useMemo(() => {
    // this is usually just a 2 item array
    return availableRewards[trader].tokens.reduce((amount, asset) => {
      if (erc20s.find((t) => t.address === asset.address)) {
        amount += asset.amount
      }

      return amount
    }, 0)
  }, [erc20s, availableRewards])

  const transaction = useMemo(() => {
    if (!erc20s.length || !rTokenContracts) {
      return undefined
    }

    const collateralsToClaim: Set<Address> = new Set()

    for (const reward of erc20s) {
      reward.collaterals.forEach((c) => collateralsToClaim.add(c))
    }

    return {
      abi: RevenueTrader,
      functionName: 'multicall',
      address: rTokenContracts[trader].address,
      args: [
        Array.from(collateralsToClaim).map((collateral) =>
          encodeFunctionData({
            abi: RevenueTrader,
            functionName: 'claimRewardsSingle',
            args: [collateral],
          })
        ),
      ],
    }
  }, [erc20s, rTokenContracts])

  // Fetch refresh state after claiming
  const handleSuccess = () => {
    setSession(Math.random())
  }

  return (
    <Box variant="layout.verticalAlign" mt={3} mb={4}>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {!erc20s.length && <Trans>Please select an asset to claim</Trans>}
        {!!erc20s.length && !wallet && (
          <Trans>Please connect your wallet</Trans>
        )}
      </Text>
      <ExecuteButton
        text={t`Claim $${formatCurrency(claimAmount)}`}
        small
        ml="auto"
        txLabel="Claim rewards"
        onSuccess={handleSuccess}
        successLabel="Success!"
        call={transaction}
      />
    </Box>
  )
}

export default ClaimFromTraderButton
