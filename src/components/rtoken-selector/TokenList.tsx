import styled from '@emotion/styled'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { Box, Flex } from 'theme-ui'
import availableTokensAtom from './atoms'

const ActionItem = styled(Flex)`
  padding: 16px;
  cursor: pointer;
  border-left: 2px solid var(--theme-ui-colors-background);

  &:hover {
    background-color: var(--theme-ui-colors-contentBackground);
    border-left: 2px solid var(--theme-ui-colors-primary);
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
    const tokens = useAtomValue(availableTokensAtom)

    return (
      <Box
        sx={{
          maxHeight: 320,
          minWidth: 250,
          overflow: 'auto',
          backgroundColor: 'background',
          borderRadius: '12px',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {Object.values(tokens).map(({ address, logo, symbol, chainId }) => (
          <ActionItem
            key={address}
            onClick={() => {
              onSelect(address, chainId as number)
            }}
          >
            <TokenItem
              sx={{ color: 'text' }}
              symbol={symbol}
              logo={logo}
              chainId={chainId}
            />
          </ActionItem>
        ))}
      </Box>
    )
  }
)

export default TokenList
