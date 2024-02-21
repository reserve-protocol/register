import { useAtomValue } from 'jotai'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { Box, Grid, Text } from 'theme-ui'
import { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import TokenAddresses from './TokenAddresses'

const TokenName = () => {
  const rToken = useAtomValue(rTokenMetaAtom)

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ fontSize: 4, flexBasis: ['100%', 'auto'] }}
      mb={[2, 0]}
      mr="3"
    >
      <CurrentRTokenLogo width={32} />
      <Text ml="2" variant="bold">
        {rToken?.name ?? ''}
      </Text>
      <Text variant="legend" ml="1">
        ({rToken?.symbol ?? ''})
      </Text>
    </Box>
  )
}

const TokenInfo = () => {
  return (
    <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
      <TokenName />
      <TokenAddresses />
    </Box>
  )
}

export default TokenInfo
