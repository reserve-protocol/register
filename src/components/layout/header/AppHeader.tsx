import { Flex, Box, Text, Divider } from 'theme-ui'
import LanguageSelector from 'components/language-selector'
import RTokenSelector from 'components/rtoken-selector'
import Account from '../../account'
import TransactionCenter from 'components/transactions/table/manager/TransactionCenter'
import styled from '@emotion/styled'

const border = '1px solid #E8E8E8'
const Separator = styled(Divider)`
  border: none;
  border-right: 1px solid #e8e8e8;
  height: 100%;
`

/**
 * Application header
 */
const AppHeader = () => (
  <Flex
    px={4}
    sx={{
      alignItems: 'center',
      position: 'relative',
      borderBottom: border,
      height: '3.5em',
    }}
  >
    <RTokenSelector />
    <Box mx="auto" />
    <Separator mr={2} />
    <Account />
    <Separator mx={2} />
    <Box ml={3} sx={{ alignItems: 'center', display: 'flex' }}>
      <LanguageSelector />
    </Box>
    <Separator />
    <TransactionCenter />
  </Flex>
)

export default AppHeader
