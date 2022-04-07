import styled from '@emotion/styled'
import { Box, BoxProps, Flex, FlexProps, Text } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import Blockies from 'react-blockies'
import { selectedAccountAtom, walletsAtom } from 'state/atoms'
import { Wallet } from 'types'

const GreenCircle = styled('span')`
  display: inline-block;
  border-radius: 50%;
  background-color: #00b902;
  height: 0.8em;
  width: 0.8em;
`

const WalletContainer = styled(Flex)`
  align-items: center;
  cursor: pointer;
`

interface WalletItemProps extends FlexProps {
  wallet: Wallet
  current?: boolean
  connected?: boolean
}

interface WalletListProps extends Omit<BoxProps, 'onChange'> {
  onChange?(walletAddress: string): void
}

const WalletItem = ({
  wallet,
  current = false,
  connected = false,
  ...props
}: WalletItemProps) => (
  <WalletContainer {...props}>
    <Blockies seed={wallet.address} />
    <Box ml={3}>
      <Text>{wallet.alias}</Text>
      {connected && <GreenCircle style={{ marginLeft: 5 }} />}
      <Text sx={{ display: 'block' }}>$ Balance</Text>
    </Box>
    {current && <Text sx={{ marginLeft: 3, color: '#ccc' }}>Selected</Text>}
  </WalletContainer>
)

const WalletList = ({ onChange = () => {}, ...props }: WalletListProps) => {
  const { account } = useWeb3React()
  const walletList = useAtomValue(walletsAtom)
  const current = useAtomValue(selectedAccountAtom)

  if (!Object.keys(walletList).length) {
    return <Box>No wallets added</Box>
  }

  return (
    <Box {...props}>
      {!!account && !!walletList[account] && (
        <Box>
          <Text>Your wallet</Text>
          <WalletItem
            onClick={() => onChange(account)}
            wallet={walletList[account]}
            current={current === account}
            connected
          />
        </Box>
      )}
      <Box mt={3}>
        <Text>Tracked accounts</Text>
        {Object.values(walletList).map((wallet) =>
          wallet.address !== account ? (
            <WalletItem
              onClick={() => onChange(wallet.address)}
              key={wallet.address}
              wallet={wallet}
              current={wallet.address === current}
            />
          ) : null
        )}
      </Box>
    </Box>
  )
}

export default WalletList
