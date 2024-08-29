import { Trans } from '@lingui/macro'
import ChainLogo from 'components/icons/ChainLogo'
import { backupCollateralAtom, basketAtom } from 'components/rtoken-setup/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useFormContext } from 'react-hook-form'
import { chainIdAtom, walletChainAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Label, Radio, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import { useSwitchNetwork } from 'wagmi'
import TokenForm from './TokenForm'
import { useEffect } from 'react'

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

const ChainOption = ({
  chainId,
  checked,
  onChange,
}: {
  chainId: number
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <Label
      variant="layout.verticalAlign"
      sx={{
        gap: 1,
        justifyContent: 'space-between',
        flexGrow: 1,
        bg: 'background',
        border: '1px solid',
        borderRadius: '8px',
        borderColor: 'border',
        p: 3,
      }}
    >
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        <ChainLogo chain={chainId} width={20} height={20} />
        <Trans>{CHAIN_TAGS[chainId]}</Trans>
      </Box>
      <Radio
        name="dark-mode"
        value={chainId}
        onChange={onChange}
        checked={checked}
      />
    </Label>
  )
}

const ChainSelector = () => {
  const [chainId, setChain] = useAtom(chainIdAtom)
  const walletChainId = useAtomValue(walletChainAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const { setValue } = useFormContext()
  const { switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    if (walletChainId && supportedChainList.includes(walletChainId)) {
      setChain(walletChainId)
    }
  }, [])

  const handleChainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      switchNetwork && switchNetwork(newChain)
    }
  }

  return (
    <Box mb="3">
      <Text variant="subtitle" ml={3} mb="2" sx={{ fontSize: 1 }}>
        Chain
      </Text>
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['column', 'column', 'column', 'row'],
          gap: 2,
          '@media (max-width: 1430px)': {
            flexDirection: 'column',
          },
        }}
      >
        {supportedChainList.map((chain) => (
          <ChainOption
            key={chain}
            chainId={chain}
            checked={chain === chainId}
            onChange={handleChainChange}
          />
        ))}
      </Box>
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
