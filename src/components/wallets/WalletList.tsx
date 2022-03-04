import { useAppSelector } from 'state/hooks'
import { Box, Flex, Text, BoxProps } from '@theme-ui/components'
import { selectCurrentWallet, Wallet } from 'state/wallets/reducer'
import Blockies from 'react-blockies'

const WalletItem = ({
  wallet,
  current,
  connected,
  onSelect = () => {},
}: {
  wallet: Wallet
  current: string | null
  connected: string | null
  onSelect?(wallet: Wallet): void
}) => (
  <Flex onClick={() => onSelect(wallet)}>
    <Blockies scale={3} seed={wallet.address} />
    <Box>
      <Text>{wallet.alias}</Text>
      <Text>$ 1234</Text>
    </Box>
  </Flex>
)

const WalletList = (props: BoxProps) => {
  const [walletList, current, connected] = useAppSelector(({ wallets }) => [
    wallets.list,
    wallets.current,
    wallets.connected,
  ])
  const [currentWallet, connectedWallet] = useAppSelector(selectCurrentWallet)

  if (!walletList.length) {
    return <Box>No wallets added</Box>
  }

  return (
    <Box {...props}>
      {!!connectedWallet && (
        <Box>
          <Text>Your wallet</Text>
          <WalletItem
            wallet={connectedWallet}
            current={current}
            connected={connected}
          />
        </Box>
      )}
      {walletList.map((wallet) =>
        wallet.address !== connected ? (
          <WalletItem wallet={wallet} current={current} connected={connected} />
        ) : null
      )}
    </Box>
  )
}

export default WalletList
