import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { transition } from 'theme'
import { Box, Divider, Flex } from 'theme-ui'
import availableTokensAtom from './atoms'

const ActionItem = styled(Flex)`
  transition: ${transition};
  padding: 16px;
  cursor: pointer;

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
    onSelect(address: string): void
    onHome(): void
  }) => {
    const tokens = useAtomValue(availableTokensAtom)

    return (
      <Box
        sx={{
          maxHeight: 320,
          overflow: 'auto',
          backgroundColor: 'contentBackground',
          borderRadius: '8px',
        }}
      >
        <Box p={3}>
          <SmallButton variant="muted" onClick={onHome}>
            <Trans>Go to Dashboard</Trans>
          </SmallButton>
        </Box>
        {!!Object.values(tokens).length && (
          <Divider sx={{ border: 'darkBorder' }} my={0} />
        )}
        {Object.values(tokens).map(({ address, logo, symbol }) => (
          <ActionItem key={address} onClick={() => onSelect(address)}>
            <TokenItem symbol={symbol} logo={logo} />
          </ActionItem>
        ))}
      </Box>
    )
  }
)

export default TokenList
