import TokenItem from 'components/token-item'
import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo, useMemo } from 'react'
import { Box } from 'theme-ui'
import availableTokensAtom from './atoms'

/**
 * Token selector list of available RTokens
 */
const TokenList = memo(
  ({ onSelect }: { onSelect(address: string, chainId: number): void }) => {
    const { list, isLoading } = useTokenList()
    const tokens = useAtomValue(availableTokensAtom)

    const orderedTokens = useMemo(() => {
      if (!tokens && isLoading) return []

      const _tokens = Object.values(tokens).map((token) => ({
        id: token.address,
        chain: token.chainId,
        ...token,
      }))
      return isLoading
        ? _tokens
        : [
            ...list,
            ..._tokens.filter(
              (token) => !list.map((rToken) => rToken.id).includes(token.id)
            ),
          ]
    }, [tokens, list, isLoading])

    return (
      <Box
        sx={{
          maxHeight: 320,
          minWidth: 250,
          overflow: 'auto',
          backgroundColor: 'backgroundNested',
          borderRadius: '12px',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {orderedTokens.map(({ id, logo, symbol, chain }) => (
          <Box
            key={id}
            sx={{
              padding: '16px',
              cursor: 'pointer',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: 'var(--theme-ui-colors-secondary)',
              },
            }}
            onClick={() => {
              onSelect(id, chain as number)
            }}
          >
            <TokenItem
              sx={{ color: 'text' }}
              symbol={symbol}
              logo={logo}
              chainId={chain}
            />
          </Box>
        ))}
      </Box>
    )
  }
)

export default TokenList
