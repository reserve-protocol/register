import { useAppSelector } from 'state/hooks'
import { Box, Text, BoxProps } from '@theme-ui/components'

const WalletList = (props: BoxProps) => {
  const [walletList, selectedWallet] = useAppSelector(({ wallets }) => [
    wallets.list,
    wallets.current && wallets.list[wallets.current],
  ])

  return (
    <Box {...props}>
      {walletList.map((wallet) => (
        <Text>{wallet.alias}</Text>
      ))}
    </Box>
  )
}

export default WalletList
