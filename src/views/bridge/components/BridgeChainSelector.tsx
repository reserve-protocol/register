import ChainLogo from 'components/icons/ChainLogo'
import CirclesIcon from 'components/icons/CirclesIcon'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import Popup from '@/components/old/popup'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS } from 'utils/constants'
import { bridgeL2Atom, selectedBridgeToken } from '../atoms'
import BRIDGE_ASSETS from '../utils/assets'

export const chainIcons = {
  [ChainId.Base]: Base,
  [ChainId.Arbitrum]: Ethereum,
}

const CHAIN_LIST = [
  { label: 'Base', id: ChainId.Base },
  { label: 'Arbitrum', id: ChainId.Arbitrum },
]

const ChainItem = ({
  id,
  label,
  selected,
  onSelect,
}: {
  id: number
  label: string
  selected: boolean
  onSelect(chain: number): void
}) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      cursor: 'pointer',
      position: 'relative',
      backgroundColor: selected ? 'contentBackground' : 'background',
      ':hover': {
        backgroundColor: 'contentBackground',
      },
    }}
    onClick={() => onSelect(id)}
    key={id}
  >
    <Box variant="layout.verticalAlign" p={3} mr={'auto'}>
      <ChainLogo chain={id} />
      <Text ml={3}>{label}</Text>
    </Box>
    <Flex
      mr={3}
      mt={2}
      sx={{
        display: selected ? 'block' : 'none',
      }}
    >
      <Check size={16} />
    </Flex>
  </Box>
)

const ChainList = ({ onSelect }: { onSelect(chain: number): void }) => {
  const selected = useAtomValue(bridgeL2Atom)

  return (
    <Box
      sx={{
        maxHeight: 320,
        overflow: 'auto',
        backgroundColor: 'background',
        borderRadius: '12px',
      }}
    >
      {CHAIN_LIST.map((chain) => (
        <ChainItem
          {...chain}
          key={chain.id}
          selected={selected === chain.id}
          onSelect={onSelect}
        />
      ))}
    </Box>
  )
}

const BridgeChainSelector = (props: BoxProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [l2, setL2] = useAtom(bridgeL2Atom)
  const setToken = useSetAtom(selectedBridgeToken)
  const [isVisible, setVisible] = useState(false)

  const handleSelect = useCallback(
    (chain: number) => {
      if (chain !== l2) {
        setL2(chain)
        setToken(BRIDGE_ASSETS[chain][1])
        searchParams.set('l2', chain.toString())
        searchParams.set('asset', 'RSR')
        setSearchParams(searchParams)
      }

      setVisible(false)
    },
    [setVisible, setSearchParams, searchParams, setL2, l2]
  )

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<ChainList onSelect={handleSelect} />}
      containerProps={{
        sx: { border: '2px solid', borderColor: 'darkBorder' },
      }}
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setVisible(!isVisible)}
      >
        {!!l2 ? <ChainLogo chain={l2} /> : <CirclesIcon />}
        <Text ml="2">{l2 ? CHAIN_TAGS[l2] : 'Select chain'}</Text>
        <Box mr="2" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default BridgeChainSelector
