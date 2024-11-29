import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import Popup from 'components/popup'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { Box, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { AvailableChain } from 'utils/chains'
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
  const rToken = useAtomValue(rTokenMetaAtom)
  const chainId = useAtomValue(chainIdAtom)
  const availableChains = useMemo(() => {
    const chains = [chainId]
    const bridged = BRIDGED_RTOKENS[chainId]?.[rToken?.address ?? '']

    if (bridged) {
      for (const token of bridged) {
        chains.push(token.chain as AvailableChain)
      }
    }

    return chains
  }, [rToken?.address, chainId])
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
        ml={[1, 0]}
        mb={[2, 0]}
        sx={{
          cursor: isBridged ? 'pointer' : 'cursor',
          flexGrow: 0,
          userSelect: 'none',
        }}
        onClick={() => isBridged && setVisible(!isVisible)}
      >
        <StackedChainLogo chains={availableChains} />
        <Text mr={2} variant="legend">
          {!!rToken && shortenAddress(rToken.address)}
        </Text>
        {isBridged && <ChevronDown size={16} />}
        {!isBridged && rToken && (
          <>
            <CopyValue mr={1} ml="auto" value={rToken.address} />
            <GoTo
              style={{ position: 'relative', top: '2px' }}
              href={getExplorerLink(
                rToken.address,
                chainId,
                ExplorerDataType.TOKEN
              )}
            />
          </>
        )}
      </Box>
    </Popup>
  )
}
export default TokenAddresses
