import { t, Trans } from '@lingui/macro'
import { useFormContext } from 'react-hook-form'
import { Box, Grid, Text, BoxProps, Flex } from 'theme-ui'
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
      <Text variant="legend" sx={{ display: 'block' }}>
        {title}
      </Text>
      <Flex variant="layout.verticalAlign">
        <Text>
          {subtitle}
          {!!time && 's'}
        </Text>
        {time && (
          <Text ml="auto" variant="legend" sx={{ fontSize: 0 }}>
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
    <Box>
      <Box variant="layout.borderBox">
        <Text sx={{ fontSize: 3 }}>
          <Trans>Base Info</Trans>
        </Text>
        <Info mt={3} title={t`Token name`} subtitle={data.name} />
        <Info mt={3} title={t`Token ticker`} subtitle={data.ticker} />
        <Info
          mt={3}
          title={t`Ownership address`}
          subtitle={data.ownerAddress}
        />
      </Box>
      <Grid mt={4} gap={4} columns={[1, 2]} variant="layout.borderBox">
        <Box
          my={-4}
          pr={4}
          py={4}
          sx={(theme: any) => ({
            borderRight: `1px solid ${theme.colors.border}`,
          })}
        >
          <Text sx={{ fontSize: 3 }}>
            <Trans>Backing</Trans>
          </Text>
          <Info
            mt={3}
            title={t`Trading delay`}
            subtitle={data.tradingDelay}
            time
          />
          <Info
            mt={3}
            title={t`Auction length`}
            subtitle={data.auctionLength}
            time
          />
          <Info mt={3} title={t`Minimun bid size`} subtitle={data.minBidSize} />
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
          <Info mt={3} title={t`Dust amount`} subtitle={data.dustAmount} />
        </Box>
        <Box>
          <Text sx={{ fontSize: 3 }}>
            <Trans>Other</Trans>
          </Text>
          <Info
            mt={3}
            title={t`One shot pause duration`}
            subtitle={data.oneshotPauseDuration}
            time
          />
          <Info
            mt={3}
            title={t`Unstaking Delay`}
            subtitle={data.unstakingDelay}
            time
          />
          <Info
            mt={3}
            title={t`Reward Period`}
            subtitle={data.rewardPeriod}
            time
          />
          <Info
            mt={3}
            title={t`Max trade volume`}
            subtitle={formatCurrency(data.maxTradeVolume)}
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default TokenConfigurationOverview
