import styled from '@emotion/styled'
import { Box, Flex, BoxProps, Text } from 'theme-ui'
import useBlockNumber from 'hooks/useBlockNumber'
import { Circle } from 'react-feather'

const SyncedBlock = (props: BoxProps) => {
  const latestBlock = useBlockNumber()

  return (
    <Flex sx={{ alignItems: 'center' }} {...props}>
      <Box
        mr={2}
        sx={{
          backgroundColor: '#00FFBF',
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
