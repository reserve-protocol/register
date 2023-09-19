import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Spinner, Text } from 'theme-ui'
import { selectedZapTokenAtom } from '../zap/state/atoms'
import { ui } from '../zap/state/ui-atoms'
import { balancesAtom } from 'state/atoms'
import { Address } from 'viem'

// TODO: Fix token balances
const zapTokenBalancesAtom = atom((get) => {
  const tokens = get(ui.input.tokenSelector.tokenSelector) || []
  const balances = get(balancesAtom)

  return tokens.reduce((acc, token) => {
    acc[token.address.address] =
      balances[token.address.address as Address]?.balance || '0'

    return acc
  }, {} as { [x: string]: string })
})

const ZapAssetsBalances = () => {
  const tokens = useAtomValue(ui.input.tokenSelector.tokenSelector) || []
  const selectedToken = useAtomValue(selectedZapTokenAtom)
  const balances = useAtomValue(zapTokenBalancesAtom)
  const setZapToken = useSetAtom(ui.input.tokenSelector.tokenSelector)

  return (
    <Box>
      <Text variant="subtitle" mb={3} p={4} pb={0}>
        <Trans>Available assets</Trans>
      </Text>
      <Box sx={{ overflow: 'auto', maxHeight: 360 }} p={4} pt={0}>
        {!tokens.length && <Spinner size={18} />}
        {tokens.map((token) => {
          const isSelected =
            selectedToken?.address.address === token.address.address

          return (
            <TokenBalance
              key={token.address.address}
              mb={2}
              symbol={token.symbol}
              balance={+balances[token.address.address] || 0}
              onClick={() => setZapToken(token)}
              sx={{
                cursor: isSelected ? 'inherit' : 'pointer',
                opacity: isSelected ? 1 : 0.5,
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default ZapAssetsBalances
