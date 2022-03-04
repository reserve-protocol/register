import { useAppSelector } from 'state/hooks'
import { Box, Text, BoxProps } from '@theme-ui/components'

const WalletList = (props: BoxProps) => {
  const walletList = useAppSelector(({ wallets }) => wallets.list)

  return (
    <Box {...props}>
      {walletList.map((wallet) => (
        <Text>{wallet.alias}</Text>
      ))}
    </Box>
  )
}

export default WalletList
