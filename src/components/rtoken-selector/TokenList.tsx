import styled from '@emotion/styled'
import TokenItem from 'components/token-item'
import useTokenList from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo, useMemo } from 'react'
import { Box, Flex } from 'theme-ui'
import availableTokensAtom from './atoms'

const ActionItem = styled(Flex)`
  padding: 16px;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background-color: var(--theme-ui-colors-secondary);
  }
`

/**
 * Token selector list of available RTokens
 */
const TokenList = memo(
  ({
    onSelect,
    onHome,
  }: {
    onSelect(address: string, chainId: number): void
    onHome(): void
  }) => {
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
          <ActionItem
            key={id}
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
          </ActionItem>
        ))}
      </Box>
    )
  }
)

export default TokenList
