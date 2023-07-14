import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Text } from 'theme-ui'
import { selectedZapTokenAtom } from '../zap/state/atoms'
import { ui } from '../zap/state/ui-atoms'
import { StringMap } from 'types'

// TODO: Fix token balances
const zapTokenBalancesAtom = atom((get) => {
  const tokens = get(ui.input.tokenSelector.tokenSelector) || []

  return {} as StringMap
  // return tokens.reduce((acc, token) => {
  //   const value = formatUnits(
  //     get(tokenBalancesStore.getBalanceAtom(token.address.address)).value ||
  //       BI_ZERO,
  //     token.decimals
  //   )

  //   acc[token.address.address] = value

  //   return acc
  // }, {} as { [x: string]: string })
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
