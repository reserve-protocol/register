import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import useSWR from 'swr'
import { Box, Text } from 'theme-ui'
import useBridgeTransactions from '../hooks/useBridgeTransactions'

const Transactions = () => {
  const account = useAtomValue(walletAtom)
  const txs = useBridgeTransactions()

  console.log('txs', txs)

  return (
    <Box>
      <Text>Transactions</Text>
      <Box></Box>
    </Box>
  )
}

export default Transactions
