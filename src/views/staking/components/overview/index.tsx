import { Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { Hash, TrendingUp } from 'react-feather'
import { rsrExchangeRateAtom, rTokenAtom } from 'state/atoms'
import { Box, Text, Flex, Grid, BoxProps, Card } from 'theme-ui'

const ExchangeRate = (props: BoxProps) => {
  const rate = useAtomValue(rsrExchangeRateAtom)
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Card {...props}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          {rate} {rToken?.stToken?.symbol ?? 'stRSR'} = 1 RSR
        </Text>
      </Flex>
    </Card>
  )
}

const Stats = (props: BoxProps) => {
  return (
    <Card {...props} p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={3}
          sx={(theme: any) => ({
            borderRight: `1px solid ${theme.colors.border}`,
            borderBottom: `1px solid ${theme.colors.border}`,
          })}
        >
          <Text variant="subtitle" mb={2}>
            <Trans>Your stake</Trans>
          </Text>
          <IconInfo
            icon={
              <TrendingUp
                size={20}
                style={{ color: 'var(--theme-ui-colors-secondaryText)' }}
              />
            }
            title="30-day mean"
            text="5.45%"
          />
        </Box>
        <Box
          p={3}
          sx={(theme: any) => ({
            borderBottom: `1px solid ${theme.colors.border}`,
          })}
        >
          <Text variant="subtitle" mb={2}>
            <Trans>Collateral backing</Trans>
          </Text>
          <IconInfo
            icon={
              <Hash
                size={20}
                style={{ color: 'var(--theme-ui-colors-secondaryText)' }}
              />
            }
            title="Current"
            text="100%"
          />
        </Box>
        <Box
          p={3}
          sx={(theme: any) => ({
            borderRight: `1px solid ${theme.colors.border}`,
          })}
        >
          <Text variant="subtitle" mb={2}>
            <Trans>Backing + Insurance</Trans>
          </Text>
          <IconInfo
            icon={
              <Hash
                size={20}
                style={{ color: 'var(--theme-ui-colors-secondaryText)' }}
              />
            }
            title="Current"
            text="140.50%"
          />
        </Box>
      </Grid>
    </Card>
  )
}

const About = (props: BoxProps) => {
  return (
    <Box
      sx={{
        border: '1px solid var(--theme-ui-colors-border)',
        borderRadius: '16px',
      }}
      p={4}
      {...props}
    >
      <Text sx={{ fontWeight: 500 }}>
        <Trans>About this app</Trans>
      </Text>
      <br /> <br />
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Senectus et netus et
        malesuada fames ac turpis egestas integer. Ac turpis egestas integer
        eget et pharetra pharetra massa massa. Nibh venenatis cras sed felis.
        Ante metus dictum at tempor commodo ullamcorper.
        <br />
        <br />
        <Text sx={{ fontWeight: 500 }}>
          <Trans>Stake/Unstake</Trans>
        </Text>
        <br /> <br />
        Ac turpis egestas maecenas pharetra. Habitant morbi tristique senectus
        et. Dapibus ultrices in iaculis nunc sed augue lacus viverra vitae.
        Bibendum est ultricies integer quis auctor. Nunc congue nisi vitae
        suscipit tellus mauris. ollicitudin. Nulla facilisi etiam dignissim diam
        quis enim lobortis.
      </Text>
    </Box>
  )
}

const Overview = (props: BoxProps) => {
  return (
    <Box {...props}>
      <ExchangeRate />
      <Stats mt={4} />
      <About mt={4} />
    </Box>
  )
}

export default Overview
