import { Flex, Text, Box } from 'rebass'
import { useBlockNumber } from '@usedapp/core'
import Account from '../../account'
import { Badge } from '@shopify/polaris'

const Header = () => {
  const latestBlock = useBlockNumber()

  return (
    <Flex
      p={2}
      height={60}
      color="white"
      bg="black"
      style={{ borderBottom: '1px solid #f5f5f5' }}
      alignItems="center"
    >
      <div className="Polaris-Badge">
        Latest synced block: <b>{latestBlock ?? '-'}</b>
      </div>
      <Box mx="auto" />
      <Account />
    </Flex>
  )
}

export default Header
