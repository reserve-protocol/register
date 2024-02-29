import { Trans } from '@lingui/macro'
import { Box, BoxProps, Card, Divider, Select, Text } from 'theme-ui'
import TokenForm from './TokenForm'
import { useAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'

const ChainSelector = () => {
  const [chainId, setChain] = useAtom(chainIdAtom)

  return (
    <Box mb="3">
      <Text variant="subtitle" ml={3} mb="2" sx={{ fontSize: 1 }}>
        Network
      </Text>
      <Select value={chainId} onChange={(e) => setChain(+e.target.value)}>
        <option value={ChainId.Mainnet}>Ethereum</option>
        <option value={ChainId.Base}>Base</option>
      </Select>
    </Box>
  )
}

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenParameters = (props: BoxProps) => (
  <Card p={4} variant="cards.form" {...props}>
    <Text variant="title">
      <Trans>Basics</Trans>
    </Text>
    <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    <ChainSelector />
    <TokenForm />
  </Card>
)

export default TokenParameters
