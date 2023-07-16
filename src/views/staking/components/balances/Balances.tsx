import { Trans } from '@lingui/macro'
import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import { useAtomValue } from 'jotai'
import {
  rsrBalanceAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenStateAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { Box, BoxProps, Divider, Flex, Grid, Text } from 'theme-ui'
import { RSR } from 'utils/constants'
import AvailableBalance from './AvailableBalance'
import PendingBalance from './PendingBalance'

// TODO: Create "Claim" component

const StakeBalance = () => {
  const rToken = useAtomValue(rTokenAtom)
  const balance = useAtomValue(stRsrBalanceAtom)
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Your staked RSR</Trans>
      </Text>
      <Flex>
        <TokenBalance
          symbol={rToken?.stToken?.symbol ?? ''}
          logoSrc="/svgs/strsr.svg"
          balance={+balance.balance}
          mr={2}
        />
        {!!rToken?.stToken && <TrackAsset token={rToken?.stToken} />}
      </Flex>
      <Box
        ml={'9px'}
        pl={3}
        pt={4}
        mt={-3}
        sx={{ borderLeft: 'solid 1px', borderColor: 'darkBorder' }}
      >
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            mr={'auto'}
            mt={2}
            symbol="RSR Value"
            logoSrc="/svgs/equals.svg"
            balance={+balance.balance * rate}
          />
        </Box>
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            symbol="USD Value"
            logoSrc="/svgs/equals.svg"
            usd
            balance={+balance.balance * rate * rsrPrice}
            mt={2}
          />
        </Box>
      </Box>
    </Box>
  )
}

const RSRBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>RSR in wallet</Trans>
      </Text>
      <Flex>
        <TokenBalance symbol="RSR" balance={+balance.balance} mr={2} />
        <TrackAsset token={RSR} />
      </Flex>
      <Box
        ml={'9px'}
        pl={3}
        pt={4}
        mt={-3}
        sx={{ borderLeft: 'solid 1px', borderColor: 'darkBorder' }}
      >
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            logoSrc="/svgs/equals.svg"
            symbol="USD Value"
            usd
            balance={+balance.balance * rsrPrice}
            mt={2}
          />
        </Box>
      </Box>
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = (props: BoxProps) => (
  <Card p={0} {...props}>
    <Grid columns={[1, 2]} gap={0}>
      <StakeBalance />
      <Box
        sx={(theme: any) => ({
          borderLeft: ['none', `1px solid ${theme.colors.darkBorder}`],
          borderTop: [`1px solid ${theme.colors.darkBorder}`, 'none'],
        })}
      >
        <RSRBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <AvailableBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <PendingBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
