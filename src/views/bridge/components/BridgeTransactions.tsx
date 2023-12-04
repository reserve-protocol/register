import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import useSWR from 'swr'
import { Box, Link, Text } from 'theme-ui'
import useBridgeTransactions from '../hooks/useWithdrawals'

const Transactions = () => {
  // const account = useAtomValue(walletAtom)
  // const txs = useBridgeTransactions()

  return (
    <Box
      p={4}
      sx={{ borderRadius: 14, border: '2px dashed', borderColor: 'warning' }}
    >
      <Text sx={{ color: 'warning' }} variant="strong">
        Under development
      </Text>
      <Text>
        This feature is not ready yet, you can process your withdrawals on the
      </Text>{' '}
      <Link href="https://bridge.base.org/transactions" target="_blank">
        Base Official Bridge
      </Link>{' '}
      <Text>RSR withdrawals will appear as "Unlisted"</Text>
    </Box>
  )
}

export default Transactions
