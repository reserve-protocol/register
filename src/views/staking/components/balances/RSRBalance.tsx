import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import { useAtomValue } from 'jotai'
import { rsrBalanceAtom, rsrPriceAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { RSR } from 'utils/constants'

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

export default RSRBalance
