import Button from 'components/button'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import Popup from 'components/popup'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { publicClient, wagmiConfig } from 'state/chain'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import { useSwitchNetwork } from 'wagmi'

export const chainIcons = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
  [ChainId.Hardhat]: Ethereum,
}

const CHAIN_LIST = [
  { label: 'Ethereum', id: ChainId.Mainnet },
  { label: 'Base', id: ChainId.Base },
]

if (import.meta.env.DEV) {
  CHAIN_LIST.push({ label: 'Hardhat', id: ChainId.Hardhat })
}

const ChainList = ({ onSelect }: { onSelect(chain: number): void }) => {
  const selected = useAtomValue(chainIdAtom)
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        maxHeight: 320,
        overflow: 'auto',
        backgroundColor: 'background',
        borderRadius: '13px',
      }}
    >
      {CHAIN_LIST.map((chain) => {
        const Icon = chainIcons[chain.id]

        return (
          <Box
            variant="layout.verticalAlign"
            sx={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => onSelect(chain.id)}
            key={chain.id}
          >
            <Box
              sx={{
                backgroundColor:
                  selected === chain.id ? 'primary' : 'background',
                width: '3px',
                height: '20px',
              }}
            />
            <Box variant="layout.verticalAlign" p={3}>
              <Icon fontSize={20} />
              <Text ml={3}>{chain.label}</Text>
            </Box>
          </Box>
        )
      })}
      <Button
        m={3}
        variant="muted"
        mt={0}
        onClick={() => navigate(ROUTES.BRIDGE)}
        small
      >
        Bridge assets
      </Button>
    </Box>
  )
}

const ChainSelector = (props: BoxProps) => {
  const [chainId, setChainId] = useAtom(chainIdAtom)
  const [isVisible, setVisible] = useState(false)
  const { switchNetwork } = useSwitchNetwork()
  const navigate = useNavigate()

  const handleSelect = (chain: number) => {
    if (chain !== chainId) {
      // Switch network if supported by wallet
      wagmiConfig.setPublicClient(publicClient({ chainId: chain }))
      setChainId(chain)
      if (switchNetwork) {
        switchNetwork(chain)
      }
      navigate('/')
    }

    setVisible(false)
  }

  const ChainIcon = chainIcons[chainId]

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<ChainList onSelect={handleSelect} />}
      containerProps={{
        sx: { border: '2px solid', borderColor: 'primary' },
      }}
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setVisible(!isVisible)}
      >
        {!!ChainIcon && <ChainIcon fontSize={20} />}
        <Box mr="2" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default ChainSelector
