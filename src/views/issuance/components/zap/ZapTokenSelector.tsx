import { memo, useCallback, useEffect, useState } from 'react'
import { Box, BoxProps, Divider, Flex, Text } from 'theme-ui'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { promiseMulticall } from 'state/web3/lib/multicall'

import { ERC20Interface } from 'abis'
import { ActionItem } from 'components/rtoken-selector'
import TokenItem from 'components/token-item'
import { ContractCall, Token } from 'types'
import Popup from 'components/popup'
import { ChevronDown, ChevronUp, Zap } from 'react-feather'
import { select, Trans } from '@lingui/macro'
import { selectedZapTokenAtom, zapTokensAtom } from 'state/atoms'
import { useAtomValue } from 'jotai'
interface TokenListProps {
  onSelect(address: string): void
  tokens: Token[]
}
export const TokenList = memo(({ onSelect, tokens }: TokenListProps) => {
  return (
    <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
      {Object.values(tokens).map(({ address, logo, symbol }) => (
        <ActionItem key={address} onClick={() => onSelect(address)}>
          <TokenItem symbol={symbol} logo={logo} />
        </ActionItem>
      ))}
    </Box>
  )
})

// TODO: these should come from zap contract
export const supportedZapTokens: string[] = [
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  '0x853d955aCEf822Db058eb8505911ED77F175b99e',
]

interface ZapTokenSelectorProps extends BoxProps {
  setZapToken(token: Token | undefined): void
  zapToken: Token | undefined
}

const ZapTokenSelector = ({
  setZapToken,
  zapToken,
  ...props
}: ZapTokenSelectorProps) => {
  const { provider } = useWeb3React()
  const [isVisible, setVisible] = useState(false)

  const zapTokens = useAtomValue(zapTokensAtom)

  const handleSelect = useCallback(
    (tokenAddr: string) => {
      if (tokenAddr !== zapToken?.address) {
        setZapToken(zapTokens.find((t) => t.address === tokenAddr))
        setVisible(false)
      }
    },
    [zapToken]
  )
  useEffect(() => {
    const updateTokens = async () => {
      if (!provider) return
      if (!zapToken) setZapToken(zapTokens[0])
    }

    updateTokens()
  }, [provider])

  if (!zapTokens.length) return null

  return (
    <Box style={{ paddingLeft: '0.5rem' }}>
      <Popup
        show={isVisible}
        onDismiss={() => setVisible(false)}
        content={<TokenList onSelect={handleSelect} tokens={zapTokens} />}
      >
        <Flex
          {...props}
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            minWidth: 100,
          }}
          onClick={() => setVisible(!isVisible)}
        >
          {zapToken && (
            <TokenItem
              sx={{
                overflow: 'hidden',
                width: [60, 'auto'],
                textOverflow: 'ellipsis',
              }}
              logo={zapToken.logo}
              symbol={zapToken.symbol}
            />
          )}
          <Box mr="2" />
          {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Flex>
      </Popup>
      <Box my={1} />
    </Box>
  )
}

export default ZapTokenSelector
