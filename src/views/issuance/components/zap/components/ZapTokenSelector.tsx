import styled from '@emotion/styled'
import Popup from 'components/popup'
import TokenItem from 'components/token-item'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { transition } from 'theme'
import { Box, Flex } from 'theme-ui'
import { ui } from '../state/ui-atoms'

export const ActionItem = styled(Flex)`
  transition: ${transition};
  padding: 16px;
  border-bottom: 1px solid var(--theme-ui-colors-border);
  cursor: pointer;

  &:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: none;
  }

  &:hover {
    background-color: var(--theme-ui-colors-secondary);
  }
`

const ZapTokenList = () => {
  const [tokens, setZapToken] = useAtom(ui.input.tokenSelector.tokenSelector)
  const entries = useMemo(
    () =>
      tokens.map((token) => ({
        token,
        selectToken: () => setZapToken(token),
      })),
    [setZapToken, tokens]
  )

  return (
    <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
      {entries.map(({ token, selectToken }) => (
        <ActionItem key={token.address.address} onClick={selectToken}>
          <TokenItem symbol={token.symbol} />
        </ActionItem>
      ))}
    </Box>
  )
}

const ChevronDisplay = () => {
  const isVisible = useAtomValue(ui.input.tokenSelector.popup)
  return isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />
}

const SelectedZapToken = () => {
  const zapToken = useAtomValue(ui.input.tokenSelector.selectedToken)

  return (
    <TokenItem
      sx={{
        overflow: 'hidden',
        width: [100, 'auto'],
        textOverflow: 'ellipsis',
      }}
      symbol={zapToken?.symbol ?? 'ETH'}
    />
  )
}

const ZapTokenSelector = () => {
  const [isVisible, setVisible] = useAtom(ui.input.tokenSelector.popup)
  const dismiss = useCallback(() => setVisible(false), [setVisible])
  const toggle = useCallback(() => setVisible((prev) => !prev), [setVisible])

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'border',
        borderRadius: 20,
      }}
      p={3}
      mb={4}
      onClick={toggle}
    >
      <SelectedZapToken />
      <Box ml="auto" />
      <Popup show={isVisible} onDismiss={dismiss} content={<ZapTokenList />}>
        <ChevronDisplay />
      </Popup>
    </Box>
  )
}

export default ZapTokenSelector
