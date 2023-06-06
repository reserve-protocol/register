import { Trans } from '@lingui/macro'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import availableTokensAtom, { DEFAULT_LOGO } from './atoms'
import BasketCubeIcon from '../icons/BasketCubeIcon'

/**
 * Top header token display
 */
const SelectedToken = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const rToken = useAtomValue(rTokenAtom)
  const tokenList = useAtomValue(availableTokensAtom)
  const { symbol, logo } = useMemo(() => {
    if (tokenList[selectedAddress]) {
      return tokenList[selectedAddress]
    }

    if (rToken) {
      return {
        symbol: rToken.symbol,
        logo: DEFAULT_LOGO,
      }
    }

    return {
      symbol: shortenAddress(selectedAddress),
      logo: DEFAULT_LOGO,
    }
  }, [selectedAddress, rToken?.symbol])

  if (!selectedAddress) {
    return (
      <Box variant="layout.verticalAlign">
        <BasketCubeIcon />
        <Text ml={2}>
          <Trans>Select RToken</Trans>
        </Text>
      </Box>
    )
  }

  return (
    <TokenItem
      sx={{ overflow: 'hidden', width: [60, 'auto'], textOverflow: 'ellipsis' }}
      logo={logo}
      symbol={symbol}
    />
  )
}

export default SelectedToken
