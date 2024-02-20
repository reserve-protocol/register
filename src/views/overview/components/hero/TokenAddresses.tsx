import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import Popup from 'components/popup'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { BRIDGED_RTOKENS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'

const BridgeTokenList = () => {
  const current = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)

  const tokenAddresses = useMemo(() => {
    const bridged = BRIDGED_RTOKENS[chainId]?.[current ?? '']

    if (!bridged) {
      return []
    }

    return [{ address: current as Address, chain: chainId }, ...bridged]
  }, [current, chainId])

  return (
    <Box p={3} backgroundColor="background">
      {tokenAddresses.map((token, i) => (
        <Box
          variant="layout.verticalAlign"
          mt={!!i ? 2 : 0}
          key={token.address}
        >
          <ChainLogo chain={token.chain} />
          <Text mx={2}>{shortenAddress(token.address)}</Text>
          <CopyValue mr={1} ml="auto" value={token.address} />
          <GoTo
            style={{ position: 'relative', top: '2px' }}
            href={getExplorerLink(
              token.address,
              token.chain,
              ExplorerDataType.TOKEN
            )}
          />
        </Box>
      ))}
    </Box>
  )
}

const TokenAddresses = () => {
  const [isVisible, setVisible] = useState(false)
  const current = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)
  const availableChains = useMemo(() => {
    const chains = [chainId]
    const bridged = BRIDGED_RTOKENS[chainId]?.[current ?? '']

    if (bridged) {
      for (const token of bridged) {
        chains.push(token.chain)
      }
    }

    return chains
  }, [current, chainId])
  const isBridged = availableChains.length > 1

  return (
    <Popup
      zIndex={0}
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<BridgeTokenList />}
      placement="auto-start"
    >
      <Box
        variant="layout.verticalAlign"
        sx={{
          cursor: isBridged ? 'pointer' : 'cursor',
          flexGrow: 0,
          userSelect: 'none',
        }}
        onClick={() => isBridged && setVisible(!isVisible)}
      >
        <StackedChainLogo chains={availableChains} />
        <Text mr={2} variant="legend">
          {!!current && shortenAddress(current)}
        </Text>
        {isBridged && <ChevronDown size={16} />}
        {!isBridged && current && (
          <>
            <CopyValue mr={1} ml="auto" value={current} />
            <GoTo
              style={{ position: 'relative', top: '2px' }}
              href={getExplorerLink(current, chainId, ExplorerDataType.TOKEN)}
            />
          </>
        )}
      </Box>
    </Popup>
  )
}
export default TokenAddresses
