import { Trans } from '@lingui/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import availableTokensAtom, { DEFAULT_LOGO } from './atoms'

/**
 * Top header token display
 */
const SelectedToken = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const rToken = useAtomValue(rTokenAtom)
  const tokenList = useAtomValue(availableTokensAtom)
  const { symbol, logo } = useMemo(() => {
    if (selectedAddress && tokenList[selectedAddress]) {
      return tokenList[selectedAddress]
    }

    if (rToken) {
      return {
        symbol: rToken.symbol,
        logo: DEFAULT_LOGO,
      }
    }

    return {
      symbol: shortenAddress(selectedAddress ?? ''),
      logo: DEFAULT_LOGO,
    }
  }, [selectedAddress, rToken?.symbol])

  if (!selectedAddress) {
    return (
      <Box variant="layout.verticalAlign">
        <CirclesIcon />
        <Text
          ml={1}
          sx={{
            display: ['none', 'flex'],
            color: 'secondaryText',
          }}
        >
          <Trans>RTokens</Trans>
        </Text>
      </Box>
    )
  }

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      <TokenLogo width={16} mr={2} symbol={symbol} src={logo} />
      <Text sx={{ display: ['none', 'block'] }}>{symbol}</Text>
    </Box>
  )
}

export default SelectedToken
