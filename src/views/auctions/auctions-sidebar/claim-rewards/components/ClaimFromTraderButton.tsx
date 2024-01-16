import { t } from '@lingui/macro'
import RevenueTrader from 'abis/RevenueTrader'
import { ExecuteButton } from 'components/button/TransactionButton'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { Trader } from 'types'
import { TraderLabels } from 'utils/constants'
import { claimsByTraderAtom } from '../atoms'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  trader: Trader
}

const ClaimFromTraderButton = ({ trader, ...props }: Props) => {
  const data = useAtomValue(claimsByTraderAtom)
  const call = useMemo(() => {
    if (!data[trader]) {
      return undefined
    }

    return {
      abi: RevenueTrader,
      functionName: 'multicall',
      address: data[trader].address,
      args: [data[trader].callDatas],
    }
  }, [data])

  return (
    <Box variant="layout.verticalAlign" {...props}>
      <Text variant="strong">
        Claim ${formatCurrency(data[trader]?.total ?? 0)} from{' '}
        {TraderLabels[trader]}
      </Text>
      <ExecuteButton
        text={t`Execute`}
        small
        ml="auto"
        successLabel="Success!"
        call={call}
      />
    </Box>
  )
}

export default ClaimFromTraderButton
