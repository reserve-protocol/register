import { useAppSelector } from 'state/hooks'
import { Box, Flex, Text, BoxProps } from '@theme-ui/components'
import { Wallet } from 'state/wallets/reducer'
import Blockies from 'react-blockies'
import { useEthers } from '@usedapp/core'

const WalletItem = ({
  wallet,
  current,
  onSelect = () => {},
}: {
  wallet: Wallet
  current: string | null
  onSelect?(wallet: Wallet): void
}) => (
  <Flex onClick={() => onSelect(wallet)}>
    <Blockies seed={wallet.address} />
    <Box>
      <Text>{wallet.alias}</Text>
      <Text>$ 1234</Text>
    </Box>
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
          <WalletItem wallet={walletList[account]} current={current} />
        </Box>
      )}
      {Object.values(walletList).map((wallet) =>
        wallet.address !== account ? (
          <WalletItem wallet={wallet} current={current} />
        ) : null
      )}
    </Box>
  )
}

export default WalletList
