import { useAppSelector } from 'state/hooks'
import { Box, Flex, Text, BoxProps } from '@theme-ui/components'
import { Wallet } from 'state/wallets/reducer'
import Blockies from 'react-blockies'
import { useEthers } from '@usedapp/core'
import styled from '@emotion/styled'

const GreenCircle = styled('span')`
  display: inline-block;
  border-radius: 50%;
  background-color: #00b902;
  height: 0.8em;
  width: 0.8em;
`

const WalletItem = ({
  wallet,
  current = false,
  connected = false,
  onSelect = () => {},
}: {
  wallet: Wallet
  current?: boolean
  connected?: boolean
  onSelect?(wallet: Wallet): void
}) => (
  <Flex onClick={() => onSelect(wallet)} sx={{ alignItems: 'center' }}>
    <Blockies seed={wallet.address} />
    <Box ml={3}>
      <Text>{wallet.alias}</Text>
      {connected && <GreenCircle style={{ marginLeft: 5 }} />}
      <Text sx={{ display: 'block' }}>$ Balance</Text>
    </Box>
    {current && <Text sx={{ marginLeft: 3, color: '#ccc' }}>Selected</Text>}
  </Flex>
)

const WalletList = (props: BoxProps) => {
  const { account } = useEthers()
  const [walletList, current] = useAppSelector(({ wallets }) => [
    wallets.list,
    wallets.current,
  ])

  if (!Object.keys(walletList).length) {
    return <Box>No wallets added</Box>
  }

  return (
    <Box {...props}>
      {!!account && !!walletList[account] && (
        <Box>
          <Text>Your wallet</Text>
          <WalletItem
            wallet={walletList[account]}
            current={current === account}
            connected
          />
        </Box>
      )}
      {Object.values(walletList).map((wallet) =>
        wallet.address !== account ? (
          <WalletItem
            key={wallet.address}
            wallet={wallet}
            current={wallet.address === current}
          />
        ) : null
      )}
    </Box>
  )
}

export default WalletList
