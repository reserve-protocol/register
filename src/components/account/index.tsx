import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import WalletIcon from 'components/icons/WalletIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import WalletModal from 'components/wallets/WalletModal'
import { ReactNode, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp } from 'react-feather'
import { Box, Button, Card, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { CHAINS } from 'utils/chains'

const Container = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
`
const ErrorWrapper = ({
  chainId,
  children,
  isValid,
}: {
  isValid: boolean
  chainId?: number
  children: ReactNode
}) =>
  isValid ? (
    <>{children}</>
  ) : (
    <MouseoverTooltipContent
      content={
        <Card sx={{ width: 320 }}>
          <Text sx={{ fontWeight: 400 }} variant="legend">
            <Trans>Network</Trans>
          </Text>
          <Flex my={2} variant="layout.verticalAlign">
            <AlertCircle size={18} color="#FF0000" />
            <Text ml={2}>Chain: {chainId}</Text>
            <Text ml="auto" sx={{ fontWeight: 500 }}>
              <Trans>Unsupported</Trans>
            </Text>
          </Flex>
          <Text variant="legend" sx={{ fontSize: 1 }}>
            <Trans>
              We only support Ethereum Mainnet. Change your network in the
              connected wallet.
            </Trans>
          </Text>
        </Card>
      }
    >
      {children}
    </MouseoverTooltipContent>
  )

/**
 * Account
 *
 * Handles wallet interaction
 */
const Account = () => {
  const [isVisible, setVisible] = useState(false)
  const { ENSName, account, chainId } = useWeb3React()
  const isInvalid = !CHAINS[chainId ?? 0]

  return (
    <>
      {!account ? (
        <Button px={3} py={2} variant="accent" onClick={() => setVisible(true)}>
          <Trans>Connect</Trans>
        </Button>
      ) : (
        <ErrorWrapper isValid={!isInvalid} chainId={chainId}>
          <Container onClick={() => setVisible(true)}>
            {!isInvalid ? (
              <WalletIcon />
            ) : (
              <AlertCircle fill="#FF0000" color="#fff" />
            )}
            <Text
              sx={{ display: ['none', 'inherit', 'inherit'] }}
              ml={2}
              pr={2}
            >
              {ENSName || shortenAddress(account)}
            </Text>
            {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Container>
        </ErrorWrapper>
      )}
      {isVisible && <WalletModal onClose={() => setVisible(false)} />}
    </>
  )
}

export default Account
