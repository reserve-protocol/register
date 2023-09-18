import { t, Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import IconInfo from 'components/info-icon'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import { useAtomValue } from 'jotai'
import {
  rsrPriceAtom,
  rTokenAtom,
  rTokenStateAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { accountCurrentPositionAtom } from 'views/staking/atoms'

const RewardedBalance = () => {
  const rewards = useAtomValue(accountCurrentPositionAtom)

  return (
    <IconInfo
      title={t`RSR Rewards`}
      help={t`Amount calculated from exchange rate difference since stake for current staked position`}
      text={formatCurrency(rewards, 3)}
      icon={<TokenLogo width={20} symbol="RSR" />}
    />
  )
}

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
        mb={3}
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
      <RewardedBalance />
    </Box>
  )
}

export default StakeBalance
