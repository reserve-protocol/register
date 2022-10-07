import { Trans } from '@lingui/macro'
import IconInfo from 'components/info-icon'
import { useAtomValue } from 'jotai'
import { Hash, TrendingUp } from 'react-feather'
import {
  rsrExchangeRateAtom,
  rTokenAtom,
  rTokenDistributionAtom,
  rTokenYieldAtom,
} from 'state/atoms'
import { Box, BoxProps, Flex, Image, Grid, Text } from 'theme-ui'

const ExchangeRate = (props: BoxProps) => {
  const rate = useAtomValue(rsrExchangeRateAtom)
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Box variant="layout.borderBox" {...props} padding={4}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          1 {rToken?.stToken?.symbol ?? 'stRSR'} = {rate} RSR
        </Text>
      </Flex>
    </Box>
  )
}

const Stats = (props: BoxProps) => {
  const distribution = useAtomValue(rTokenDistributionAtom)
  const { tokenApy, stakingApy } = useAtomValue(rTokenYieldAtom)

  return (
    <Box {...props} variant="layout.borderBox" p={0}>
      <Grid gap={0} columns={2}>
        <Box
          p={4}
          sx={{
            borderRight: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'darkBorder',
          }}
        >
          <Text variant="subtitle" mb={3}>
            <Trans>Your stake</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/trendup.svg" />}
            title="Est. APY"
            text={`${stakingApy}%`}
          />
        </Box>
        <Box
          p={4}
          sx={{ borderBottom: '1px solid', borderColor: 'darkBorder' }}
        >
          <Text variant="subtitle" mb={3}>
            <Trans>Collateral backing</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/backing.svg" />}
            title="Current"
            text={`${distribution.backing}%`}
          />
        </Box>
        <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'darkBorder' }}>
          <Text variant="subtitle" mb={3}>
            <Trans>Backing + Insurance</Trans>
          </Text>
          <IconInfo
            icon={<Image src="/svgs/insurance.svg" />}
            title="Current"
            text={`${distribution.backing + distribution.insurance}%`}
          />
        </Box>
      </Grid>
    </Box>
  )
}

const About = (props: BoxProps) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'darkBorder',
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
