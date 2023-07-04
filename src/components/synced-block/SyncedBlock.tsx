import { useAtomValue } from 'jotai'
import { blockAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'

// TODO: Loading state when blockTag on multicall is different than current block?
const SyncedBlock = (props: BoxProps) => {
  const latestBlock = useAtomValue(blockAtom)

  return (
    <Flex sx={{ alignItems: 'center' }} {...props}>
      <Box
        mr={2}
        sx={{
          backgroundColor: !latestBlock ? '#FF0000' : '#00FFBF',
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
