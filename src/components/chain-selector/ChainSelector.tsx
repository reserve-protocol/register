import Button from '@/components/old/button'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import Popup from '@/components/old/popup'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { ROUTES } from 'utils/constants'

export const chainIcons = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
}

const CHAIN_LIST = [
  { label: 'Ethereum', id: ChainId.Mainnet },
  { label: 'Base', id: ChainId.Base },
]

const ChainList = ({ onSelect }: { onSelect(chain: number): void }) => {
  const selected = useAtomValue(chainIdAtom)
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        maxHeight: 320,
        overflow: 'auto',
        backgroundColor: 'background',
        borderRadius: '12px',
      }}
    >
      {CHAIN_LIST.map((chain) => {
        const Icon = chainIcons[chain.id]
        const isSelected = selected === chain.id

        return (
          <Box
            variant="layout.verticalAlign"
            sx={{
              cursor: 'pointer',
              position: 'relative',
              backgroundColor: isSelected ? 'contentBackground' : 'background',
              // transition: transition,
              ':hover': {
                backgroundColor: 'contentBackground',
                borderLeft: '2px solid',
                borderColor: 'primary',
              },
            }}
            onClick={() => onSelect(chain.id)}
            key={chain.id}
          >
            <Box variant="layout.verticalAlign" p={3} mr={'auto'}>
              <Icon fontSize={20} />
              <Text ml={3}>{chain.label}</Text>
            </Box>
            <Flex
              mr={3}
              mt={2}
              sx={{
                display: selected === chain.id ? 'block' : 'none',
              }}
            >
              <Check size={16} />
            </Flex>
          </Box>
        )
      })}
      <Box p={3} sx={{ borderTop: '1px solid', borderColor: 'darkBorder' }}>
        <Button
          variant="muted"
          onClick={() => {
            mixpanel.track('Clicked Bridge', {})
            navigate(ROUTES.BRIDGE)
          }}
        >
          Bridge assets
        </Button>
      </Box>
    </Box>
  )
}

const ChainSelector = (props: BoxProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const chainId = useAtomValue(chainIdAtom)
  const selectedRToken = useAtomValue(selectedRTokenAtom)
  const [isVisible, setVisible] = useState(false)
  const navigate = useNavigate()

  const handleSelect = (chain: number) => {
    if (chain !== chainId && selectedRToken) {
      navigate(`/?chainId=${chain}`)
    } else {
      searchParams.set('chainId', chain.toString())
      setSearchParams(searchParams)
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
        sx: { border: '2px solid', borderColor: 'darkBorder' },
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
