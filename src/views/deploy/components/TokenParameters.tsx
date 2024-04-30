import { Trans } from '@lingui/macro'
import { Box, BoxProps, Card, Divider, Select, Text } from 'theme-ui'
import TokenForm from './TokenForm'
import { useAtom } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { ChainId } from 'utils/chains'
import { useResetAtom } from 'jotai/utils'
import { backupCollateralAtom, basketAtom } from 'components/rtoken-setup/atoms'
import { useFormContext } from 'react-hook-form'

type Defaults = [string, string][]

const mainnetDefaults: Defaults = [
  ['withdrawalLeak', '5'],
  ['dutchAuctionLength', '1800'],
  ['minTrade', '1000'],
]
const l2Defaults: Defaults = [
  ['withdrawalLeak', '1'],
  ['dutchAuctionLength', '900'],
  ['minTrade', '100'],
]

const ChainSelector = () => {
  const [chainId, setChain] = useAtom(chainIdAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const { setValue } = useFormContext()

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = +e.target.value

    if (chainId !== newChain) {
      resetBasket()
      resetBackup()

      const defaults =
        newChain === ChainId.Mainnet ? mainnetDefaults : l2Defaults

      for (const [key, value] of defaults) {
        setValue(key, value)
      }

      setChain(newChain)
    }
  }

  return (
    <Box mb="3">
      <Text variant="subtitle" ml={3} mb="2" sx={{ fontSize: 1 }}>
        Network
      </Text>
      <Select value={chainId} onChange={handleChainChange}>
        <option value={ChainId.Mainnet}>Ethereum</option>
        <option value={ChainId.Base}>Base</option>
        <option value={ChainId.Arbitrum}>Arbitrum One</option>
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
