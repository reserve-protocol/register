import { useWeb3React } from '@web3-react/core'
import useBlockNumber from 'hooks/useBlockNumber'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { CHAINS } from 'utils/chains'

const SyncedBlock = (props: BoxProps) => {
  const { chainId } = useWeb3React()
  const latestBlock = useBlockNumber()

  return (
    <Flex sx={{ alignItems: 'center' }} {...props}>
      <Box
        mr={2}
        sx={{
          backgroundColor: !CHAINS[chainId ?? 0] ? '#FF0000' : '#00FFBF',
          borderRadius: '100%',
          width: 8,
          height: 8,
        }}
      />
      <Text variant="legend" sx={{ fontSize: 0 }}>
        {latestBlock || '-'}
      </Text>
    </Flex>
  )
}

export default SyncedBlock
