import { Flex, Text, Box } from 'rebass'
import Account from '../../account'

const Header = () => (
  <Flex
    p={2}
    height={60}
    color="white"
    bg="black"
    alignItems="center"
  >
    <Text p={2} fontSize={2} fontWeight="bold">Reserve Explorer</Text>
    <Box mx="auto" />
    <Account />
  </Flex>
)

export default Header
