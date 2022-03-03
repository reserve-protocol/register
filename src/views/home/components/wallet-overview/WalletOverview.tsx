import { BoxProps, Box } from '@theme-ui/components'

interface Props extends BoxProps {
  wallet: { address: string; alias: string }
}

const WalletOverview = ({ wallet, ...props }: Props) => {
  const mockData = {
    ...wallet,
  }

  return <Box {...props}>Wallet {mockData.alias} adasdsads</Box>
}

export default WalletOverview
