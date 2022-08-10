import { t, Trans } from '@lingui/macro'
import { useFormContext } from 'react-hook-form'
import { Box, Grid, Text, BoxProps, Flex, Divider } from 'theme-ui'
import { formatCurrency } from 'utils'

interface InfoProps extends BoxProps {
  title: string
  subtitle: string
  time?: boolean
}

const getTime = (seconds: number) => {
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const dDisplay = d > 0 ? `${d}d` : ''
  const hDisplay = h > 0 ? h + `${h}h` : ''
  const mDisplay = m > 0 ? m + `${m}m` : ''
  const sDisplay = s > 0 ? s + `${s}s` : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

const Info = ({ title, subtitle, time, ...props }: InfoProps) => {
  return (
    <Box {...props}>
      <Text variant="legend" sx={{ display: 'block', fontSize: 0 }}>
        {title}
      </Text>
      <Flex variant="layout.verticalAlign">
        <Text sx={{ fontSize: 2 }}>
          {subtitle}
          {!!time && 's'}
        </Text>
        {time && (
          <Text ml="auto" variant="legend" sx={{ fontSize: 1 }}>
            {getTime(Number(subtitle))}
          </Text>
        )}
      </Flex>
    </Box>
  )
}

const TokenConfigurationOverview = () => {
  const { getValues } = useFormContext()
  const data = getValues()

  return (
    <Box p={5}>
      <Text variant="title">
        <Trans>Base Info</Trans>
      </Text>
      <Divider my={3} />
      <Info mt={3} title={t`Token name`} subtitle={data.name} />
      <Info mt={3} title={t`Token ticker`} subtitle={data.ticker} />
      <Info mt={3} title={t`Manifesto??????`} subtitle={data.manifesto} />
      <Info
        mt={3}
        mb={4}
        title={t`Ownership address`}
        subtitle={data.ownerAddress}
      />
      <Text variant="title">
        <Trans>Backing</Trans>
      </Text>
      <Divider my={3} />
      <Info mt={3} title={t`Trading delay`} subtitle={data.tradingDelay} time />
      <Info
        mt={3}
        title={t`Auction length`}
        subtitle={data.auctionLength}
        time
      />
      <Info
        mt={3}
        title={t`Backing buffer`}
        subtitle={`${data.backingBuffer}%`}
      />
      <Info
        mt={3}
        title={t`Max trade slippage`}
        subtitle={`${data.maxTradeSlippage}%`}
      />
      <Info mt={3} title={t`Issuance rate`} subtitle={data.issuanceRate} />
      <Info mt={3} mb={4} title={t`Dust amount`} subtitle={data.dustAmount} />
      <Text variant="title">
        <Trans>Other</Trans>
      </Text>
      <Divider my={3} />
      <Info
        mt={3}
        title={t`One shot freeze duration`}
        subtitle={data.oneshotFreezeDuration}
        time
      />
      <Info
        mt={3}
        title={t`Unstaking Delay`}
        subtitle={data.unstakingDelay}
        time
      />
      <Info mt={3} title={t`Reward Period`} subtitle={data.rewardPeriod} time />
      <Info
        mt={3}
        title={t`Min trade volume`}
        subtitle={formatCurrency(data.minTrade)}
      />
      <Info
        mt={3}
        title={t`Max trade volume`}
        subtitle={formatCurrency(data.maxTrade)}
      />
    </Box>
  )
}

export default TokenConfigurationOverview
