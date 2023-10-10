import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import TokenItem from 'components/token-item'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { transition } from 'theme'
import { Box, Divider, Flex, Text } from 'theme-ui'
import BackHomeIcon from '../icons/BackHomeIcon'
import availableTokensAtom from './atoms'
import { ChainId } from 'utils/chains'
import { chainIdAtom } from 'state/atoms'
import { useSwitchNetwork } from 'wagmi'

const ActionItem = styled(Flex)`
  transition: ${transition};
  padding: 16px;
  cursor: pointer;

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
    onSelect(address: string): void
    onHome(): void
  }) => {
    const { switchNetwork } = useSwitchNetwork()
    const currentChainId = useAtomValue(chainIdAtom)
    const tokens = useAtomValue(availableTokensAtom)

    return (
      <Box
        sx={{
          maxHeight: 320,
          minWidth: 250,
          overflow: 'auto',
          backgroundColor: 'background',
          borderRadius: '12px',
        }}
      >
        <Box>
          <ActionItem
            sx={{ display: 'flex', alignItems: 'center' }}
            onClick={onHome}
          >
            <BackHomeIcon />
            <Text ml={2} sx={{ color: 'text' }}>
              <Trans>Dashboard</Trans>
            </Text>
          </ActionItem>
        </Box>
        {!!Object.values(tokens).length && (
          <Divider
            sx={{ border: '1px dashed', borderColor: 'darkBorder' }}
            my={0}
          />
        )}
        {Object.values(tokens).map(({ address, logo, symbol, chainId }) => (
          <ActionItem
            key={address}
            onClick={async () => {
              if (currentChainId !== chainId && switchNetwork) {
                switchNetwork(chainId!)
              }
              onSelect(address)
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
