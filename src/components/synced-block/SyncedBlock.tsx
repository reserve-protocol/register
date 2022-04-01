import styled from '@emotion/styled-base'
import { Box, BoxProps, Text } from '@theme-ui/components'
import useBlockNumber from 'hooks/useBlockNumber'

const Container = styled(Box)`
  border: 1px solid #ccc;
  padding: 5px;
  font-size: 12px;
  color: #77838f;
  border-radius: 4px;
`

const SyncedBlock = (props: BoxProps) => {
  const latestBlock = useBlockNumber()

  return (
    <Container {...props}>
      <Text>Latest synced block: {latestBlock || '-'}</Text>
    </Container>
  )
}

export default SyncedBlock
